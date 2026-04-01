import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AuthController,
    CMSAnalyticsEvent,
    Entity,
    EntityCollection,
    EntityCustomViewParams,
    EntityStatus,
    EntityValues,
    FormContext,
    PluginFormActionProps,
    PropertyConfig,
    PropertyFieldBindingProps,
    EntityFormProps,
    OnUpdateParams,
} from "@rebasepro/types";
import { deepEqual as equal } from "fast-equals";

import { ErrorBoundary, getFormFieldKeys } from "../components";
import { getDefaultValuesFor, getLocalChangesBackup, getValueInPath, isHidden, isObject, isReadOnly, mergeDeep } from "@rebasepro/common";

import {
    saveEntityWithCallbacks,
    useAuthController,
    useCustomizationController,
    useDataSource,
    useRebaseContext,
    useCollectionRegistryController,
    useSideEntityController,
    useSnackbarController,
    useTranslation
} from "../hooks";
import { Alert, CheckIcon, Chip, cls, EditIcon, NotesIcon, paperMixin, Tooltip, Typography } from "@rebasepro/ui";
import { Formex, FormexController, getIn, setIn, useCreateFormex } from "@rebasepro/formex";
import { useAnalyticsController } from "../hooks/useAnalyticsController";
import { FormEntry, FormLayout, LabelWithIconAndTooltip, PropertyFieldBinding } from "../form";
import { ValidationError } from "yup";
import {
    flattenKeys,
    getEntityFromCache,
    removeEntityFromCache,
    removeEntityFromMemoryCache,
    saveEntityToCache
} from "../util/entity_cache";
import { ErrorFocus } from "./components/ErrorFocus";
import { CustomFieldValidator, getYupEntitySchema } from "./validation";
import { EntityFormActions } from "./EntityFormActions";
import { EntityFormActionsProps } from "@rebasepro/types";
import { LocalChangesMenu } from "./components/LocalChangesMenu";


import { useDebouncedCallback } from "../util";
import { getEntityTitlePropertyKey } from "../util/previews";

// extract touched values for nested touched trees and map to current values
export function extractTouchedValues(values: any, touched: Record<string, boolean>): Record<string, any> {
    let acc: Record<string, any> = {};
    if (!touched || typeof touched !== "object") {
        return acc;
    }

    Object.entries(touched).forEach(([key, value]) => {
        if (value) {
            acc = setIn(acc, key, getIn(values, key));
        }
    })

    return acc;
}

export function getChanges<T extends object>(source: Partial<T>, comparison: Partial<T>): Partial<T> {
    const changes: Partial<T> = {};

    if (!source) {
        return {};
    }
    if (!comparison) {
        return source;
    }

    const allKeys = Array.from(new Set([...Object.keys(source), ...Object.keys(comparison)]));

    for (const key of allKeys) {
        const sourceValue = (source as any)[key];
        const comparisonValue = (comparison as any)[key];

        if (equal(sourceValue, comparisonValue)) {
            continue;
        }

        const sourceHasKey = source && typeof source === "object" && Object.prototype.hasOwnProperty.call(source, key);
        const comparisonHasKey = comparison && typeof comparison === "object" && Object.prototype.hasOwnProperty.call(comparison, key);

        if (comparisonHasKey && !sourceHasKey) {
            (changes as any)[key] = undefined;
        } else if (Array.isArray(sourceValue)) {
            const comparisonArray = Array.isArray(comparisonValue) ? comparisonValue : [];
            if (sourceValue.length < comparisonArray.length) {
                (changes as any)[key] = sourceValue;
                continue;
            }
            const changedArray = sourceValue.map((item, index) => {
                const comparisonItem = comparisonArray[index];
                if (equal(item, comparisonItem)) {
                    return null;
                }
                if (isObject(item) && item && isObject(comparisonItem) && comparisonItem) {
                    const nestedChanges = getChanges(item, comparisonItem);
                    return Object.keys(nestedChanges).length > 0 ? nestedChanges : item;
                }
                return item;
            });
            if (changedArray.some(item => item !== null) || sourceValue.length > comparisonArray.length) {
                (changes as any)[key] = changedArray;
            }
        } else if (isObject(sourceValue) && sourceValue && isObject(comparisonValue) && comparisonValue) {
            const nestedChanges = getChanges(sourceValue, comparisonValue);
            if (Object.keys(nestedChanges).length > 0) {
                (changes as any)[key] = nestedChanges;
            }
        } else {
            (changes as any)[key] = sourceValue;
        }
    }

    return changes;
}

export function EntityForm<M extends Record<string, any>>({
    path,
    entityId: entityIdProp,
    collection,
    onValuesModified,
    onIdChange,
    onSaved,
    entity,
    initialDirtyValues,
    onFormContextReady,
    forceActionsAtTheBottom,
    initialStatus,
    className,
    onStatusChange,
    onEntityChange,
    openEntityMode = "full_screen",
    formex: formexProp,
    disabled: disabledProp,
    Builder,
    EntityFormActionsComponent = EntityFormActions,
    showDefaultActions = true,
    showEntityPath = true,
    children
}: EntityFormProps<M>) {
    const { t } = useTranslation();
    const sideEntityController = useSideEntityController();
    const collectionRegistryController = useCollectionRegistryController();

    const navigateBack = useCallback(() => {
        if (openEntityMode === "side_panel") {
            // If we are in side panel mode, we close the side panel
            sideEntityController.close();
        } else {
            window.history.back();
        }
    }, []);

    const authController = useAuthController();
    const [status, setStatus] = useState<EntityStatus>(initialStatus);

    const updateStatus = (status: EntityStatus) => {
        setStatus(status);
        onStatusChange?.(status);
    };

    const [valuesToBeSaved, setValuesToBeSaved] = useState<EntityValues<M> | undefined>(undefined);
    useDebouncedCallback(valuesToBeSaved, () => {
        if (valuesToBeSaved)
            saveEntity({
                entityId: entityIdProp,
                collection,
                path,
                values: valuesToBeSaved
            });
    }, false, 2000);

    const dataSource = useDataSource(collection);
    const snackbarController = useSnackbarController();
    const customizationController = useCustomizationController();
    const context = useRebaseContext();
    const analyticsController = useAnalyticsController();



    const [underlyingChanges] = useState<Partial<EntityValues<M>>>({});




    const initialEntityId: string | number | undefined = useMemo(() => {
        if (status === "new" || status === "copy") {
            return undefined;
        } else {
            return entityIdProp;
        }
    }, [entityIdProp, status]);

    const [entityId, setEntityId] = useState<string | number | undefined>(initialEntityId);
    const [entityIdError, setEntityIdError] = useState<boolean>(false);
    const [savingError, setSavingError] = useState<Error | undefined>();

    const autoSave = collection.formAutoSave;

    const baseInitialValues = useMemo(() => getInitialEntityValues(authController, collection, path, status, entity, customizationController.propertyConfigs), [authController, collection, path, status, entity, customizationController.propertyConfigs]);

    const localChangesDataRaw = useMemo(() => entityId
        ? getEntityFromCache(path + "/" + entityId)
        : getEntityFromCache(path + "#new"), [entityId, path]);

    const [localChangesCleared, setLocalChangesCleared] = useState<boolean>(false);

    const localChangesBackup = getLocalChangesBackup(collection);
    const autoApplyLocalChanges = localChangesBackup === "auto_apply";
    const manualApplyLocalChanges = localChangesBackup === "manual_apply";

    const onSubmit = (values: EntityValues<M>, formexController: FormexController<EntityValues<M>>) => {



        setSavingError(undefined);
        setEntityIdError(false);

        if (status === "existing") {
            if (!entity?.id) throw Error("Form misconfiguration when saving, no id for existing entity");
        } else if (status !== "new" && status !== "copy") {
            throw Error("New FormType added, check EntityForm");
        }

        return save(values)
            ?.then((savedEntity) => {
                formexController.resetForm({
                    values: savedEntity?.values || values,
                    submitCount: 0,
                    touched: {}
                });
            })
            .finally(() => {
                formexController.setSubmitting(false);
            });
    };

    const [initialValues, initialDirty] = useMemo(() => {
        const initialValuesWithLocalChanges: Partial<M> = autoApplyLocalChanges && localChangesDataRaw ? mergeDeep(baseInitialValues, localChangesDataRaw as Partial<M>) : baseInitialValues;
        const initialValues = initialDirtyValues ? mergeDeep(initialValuesWithLocalChanges, initialDirtyValues) : initialValuesWithLocalChanges;
        const initialDirty = Boolean(initialDirtyValues) && initialDirtyValues && Object.keys(initialDirtyValues).length > 0;
        return [initialValues, initialDirty];
    }, [autoApplyLocalChanges, localChangesDataRaw, baseInitialValues, initialDirtyValues]);

    const localChangesData = useMemo(() => {
        if (!localChangesDataRaw) {
            return undefined;
        }
        return getChanges(localChangesDataRaw, initialValues);
    }, [localChangesDataRaw, initialValues]);

    const hasLocalChanges = !localChangesCleared && localChangesData && Object.keys(localChangesData).length > 0;

    const formex: FormexController<M> = formexProp ?? useCreateFormex<M>({
        initialValues: initialValues as M,
        initialDirty,
        initialTouched: initialDirtyValues ?
            flattenKeys(initialDirtyValues!)
                .reduce((previousValue, currentValue) => ({
                    ...previousValue,
                    [currentValue]: true
                }), {})
            : {},
        onSubmit,
        onReset: () => {
            clearDirtyCache();
            onValuesModified?.(false, initialValues as M);
        },
        onValuesChangeDeferred: (values: M, controller: FormexController<M>) => {
            const key = (status === "new" || status === "copy") ? path + "#new" : path + "/" + entityId;
            if (controller.dirty) {
                const touchedValues = extractTouchedValues(values, controller.touched);
                saveEntityToCache(key, touchedValues);
            }
        },
        validation: async (values) => {
            return validationSchema?.validate(values, { abortEarly: false })
                .then(() => {
                    return {};
                })
                .catch((e: any) => {
                    return yupToFormErrors(e);
                });
        }
    });

    useEffect(() => {

        const handleKeyDown = (e: KeyboardEvent) => {
            const isUndo = (e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "z";
            const isRedo =
                ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "z") ||
                ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === "y");

            if (isUndo && formex.canUndo) {
                e.preventDefault();
                formex.undo();
            } else if (isRedo && formex.canRedo) {
                e.preventDefault();
                formex.redo();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [formex]);

    const beforeSaveHookError = useCallback((e: Error) => {
        snackbarController.open({
            type: "error",
            message: `${t("error_before_saving")}: ${e?.message}`
        });
        console.error(e);
    }, [snackbarController]);

    const afterSaveHookError = useCallback((e: Error) => {
        snackbarController.open({
            type: "error",
            message: `${t("error_after_saving")}: ${e?.message}`
        });
        console.error(e);
    }, [snackbarController]);

    function clearDirtyCache() {
        if (status === "new" || status === "copy") {
            removeEntityFromMemoryCache(path + "#new");
            removeEntityFromCache(path + "#new");
        } else {
            removeEntityFromMemoryCache(path + "/" + entityId);
            removeEntityFromCache(path + "/" + entityId);
        }
    }

    const afterSave = (updatedEntity: Entity<M>) => {

        clearDirtyCache();
        onValuesModified?.(false, updatedEntity.values);
        if (!autoSave)
            snackbarController.open({
                type: "success",
                message: `${collection.singularName ?? collection.name}: ${t("saved_correctly")}`
            });
        onEntityChange?.(updatedEntity);
        updateStatus("existing");
        setEntityId(updatedEntity.id);

        if (onSaved) {
            onSaved({
                entity: updatedEntity,
                status,
                path,
                entityId: updatedEntity.id,
                collection
            });
        }
    };

    const afterSaveError = useCallback((e: Error) => {
        snackbarController.open({
            type: "error",
            title: t("error_saving_entity"),
            message: e?.message
        });
        console.error("Error saving entity", path, entityId, e);
        console.error(e);
    }, [entityId, path, snackbarController]);

    const saveEntity = ({
        values,
        previousValues,
        entityId,
        collection,
        path
    }: {
        collection: EntityCollection<M>,
        path: string,
        entityId: string | number | undefined,
        values: M,
        previousValues?: M,
    }): Promise<Entity<M>> => {
        return saveEntityWithCallbacks({
            path: path,
            entityId,
            values,
            previousValues,
            collection,
            status,
            dataSource,
            context,
            afterSave,
            afterSaveError
        });
    };

    type EntityFormSaveParams<M extends Record<string, any>> = {
        collection: EntityCollection<M>,
        path: string,
        entityId: string | number | undefined,
        values: EntityValues<M>,
        previousValues?: EntityValues<M>,
        autoSave: boolean
    };

    const onSaveEntityRequest = async ({
        collection,
        path,
        entityId,
        values,
        previousValues,
        autoSave
    }: EntityFormSaveParams<M>): Promise<Entity<M> | void> => {
        if (!status)
            return;
        if (autoSave) {
            setValuesToBeSaved(values);
            return Promise.resolve();
        } else {
            return saveEntity({
                collection,
                path,
                entityId,
                values,
                previousValues
            });
        }
    };

    const lastSavedValues = useRef<EntityValues<M> | undefined>(entity?.values);
    const save = async (values: EntityValues<M>): Promise<Entity<M> | void> => {
        let valuesToSave = values;

        lastSavedValues.current = valuesToSave;
        return onSaveEntityRequest({
            collection: collection,
            path,
            entityId,
            values: valuesToSave,
            previousValues: entity?.values,
            autoSave: autoSave ?? false
        }).then((savedEntity) => {
            const eventName: CMSAnalyticsEvent = status === "new"
                ? "new_entity_saved"
                : (status === "copy" ? "entity_copied" : (status === "existing" ? "entity_edited" : "unmapped_event"));
            analyticsController.onAnalyticsEvent?.(eventName, { path });
            return savedEntity;
        }).catch(e => {
            console.error(e);
            setSavingError(e);
        });
    };

    const disabled = formex.isSubmitting || Boolean(disabledProp);

    const formContext: FormContext<M> = {
        // @ts-ignore
        setFieldValue: useCallback(formex.setFieldValue, []),
        values: formex.values,
        collection: collection,
        entityId: entityId as string,
        path,
        save,
        formex,
        entity,
        savingError,
        status,
        openEntityMode,
        disabled
    };

    useEffect(() => {
        onFormContextReady?.(formContext);
    }, [formex.version, collection, entityId, path]);



    const pluginActions: React.ReactNode[] = [];
    const pluginBeforeTitle: React.ReactNode[] = [];
    const plugins = customizationController.plugins;

    const actionsDisabled = disabled || formex.isSubmitting || (status === "existing" && !formex.dirty) || Boolean(disabledProp);
    const parentCollectionIds = collectionRegistryController.getParentCollectionIds(path);

    if (plugins && collection) {
        const actionProps: PluginFormActionProps = {
            entityId,
            parentCollectionIds,
            path: path,
            status,
            collection,
            context,
            formContext,
            openEntityMode,
            disabled: actionsDisabled,
        };
        pluginActions.push(...plugins.map((plugin) => (
            plugin.form?.Actions
                ? <plugin.form.Actions
                    key={`actions_${plugin.key}`} {...actionProps} />
                : null
        )).filter(Boolean));
    }

    const titlePropertyKey = getEntityTitlePropertyKey(collection, customizationController.propertyConfigs);
    const title = (formex.values && titlePropertyKey ? getValueInPath(formex.values, titlePropertyKey) as React.ReactNode : undefined)
        ?? collection.singularName
        ?? collection.name;



    useEffect(() => {
        if (!autoSave) {
            onValuesModified?.(modified, formex.values);
        }
    }, [formex.dirty]);

    const modified = formex.dirty;

    const uniqueFieldValidator: CustomFieldValidator = useCallback(({
        name,
        value
    }) => dataSource.checkUniqueField(path, name, value, entityId, collection),
        [dataSource, path, entityId]);

    const validationSchema = useMemo(() => getYupEntitySchema(
        entityId,
        collection.properties,
        uniqueFieldValidator),
        [entityId, collection.properties, uniqueFieldValidator]);

    useOnAutoSave(autoSave, formex, lastSavedValues, save);

    useEffect(() => {
        if (!autoSave && !formex.isSubmitting && underlyingChanges && entity) {
            // we update the form fields from the Firestore data
            // if they were not touched
            Object.entries(underlyingChanges).forEach(([key, value]) => {
                const formValue = formex.values[key];
                if (!equal(value, formValue) && !formex.touched[key]) {
                    console.debug("Updated value from the datasource:", key, value);
                    formex.setFieldValue(key, value !== undefined ? value : null);
                }
            });
        }
    }, [formex.isSubmitting, autoSave, underlyingChanges, entity, formex.values, formex.touched, formex.setFieldValue]);

    const formFieldKeys = getFormFieldKeys(collection);

    const formFields = () => {

        if (Builder) {
            return <Builder
                collection={collection}
                entity={entity}
                modifiedValues={formex.values}
                formContext={formContext}
            />;
        }
        return (
            <FormLayout>
                {formFieldKeys.map((key) => {
                    const property = collection.properties[key];
                    if (property) {

                        const underlyingValueHasChanged: boolean =
                            !!underlyingChanges &&
                            Object.keys(underlyingChanges).includes(key) &&
                            formex.touched[key];
                        const isNew = status === "new" || status === "copy";
                        const isStringOrNumber = property.type === "string" || property.type === "number";
                        const isIdAndAuto = isStringOrNumber && "isId" in property && typeof property.isId === "string" && property.isId !== "manual";
                        const disabled = disabledProp || (!autoSave && formex.isSubmitting) || isReadOnly(property) || Boolean(property.disabled) || (!isNew && "isId" in property && Boolean(property.isId)) || (isNew && isIdAndAuto);
                        const hidden = isHidden(property);
                        if (hidden) return null;
                        const widthPercentage = property.widthPercentage ?? 100;
                        const cmsFormFieldProps: PropertyFieldBindingProps<M> = {
                            propertyKey: key,
                            disabled,
                            property,
                            includeDescription: Boolean(property.description),
                            underlyingValueHasChanged: underlyingValueHasChanged && !autoSave,
                            context: formContext,
                            partOfArray: false,
                            minimalistView: false,
                            autoFocus: false
                        };

                        return (
                            <FormEntry propertyKey={key}
                                widthPercentage={widthPercentage}
                                key={`field_${key}`}>
                                <PropertyFieldBinding {...cmsFormFieldProps} />
                            </FormEntry>
                        );
                    }

                    const additionalField = collection.additionalFields?.find(f => f.key === key);
                    if (additionalField && entity) {
                        const Builder = additionalField.Builder;
                        if (!Builder && !additionalField.value) {
                            throw new Error("When using additional fields you need to provide a Builder or a value");
                        }
                        const child = Builder
                            ? <Builder entity={entity} context={context} />
                            : <div className={"w-full"}>
                                {additionalField.value?.({
                                    entity,
                                    context
                                })?.toString()}
                            </div>;

                        return (
                            <div key={`additional_${key}`} className={"w-full"}>
                                <LabelWithIconAndTooltip
                                    propertyKey={key}
                                    icon={<NotesIcon size={"small"} />}
                                    title={additionalField.name}
                                    className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"} />
                                <div
                                    className={cls(paperMixin, "w-full min-h-14 p-4 md:p-6 overflow-x-scroll no-scrollbar")}>
                                    <ErrorBoundary>
                                        {child}
                                    </ErrorBoundary>
                                </div>
                            </div>
                        );
                    }

                    console.warn(`Property ${key} not found in collection ${collection.name} in properties or additional fields. Skipping.`);
                    return null;
                }).filter(Boolean)}
            </FormLayout>
        );
    };

    const formRef = useRef<HTMLDivElement>(null);

    const formView = <ErrorBoundary>
        <>
            {pluginBeforeTitle}

            {!Builder && <div className={"w-full flex flex-col items-start my-4 lg:my-6"}>
                <Typography
                    className={"my-4 grow line-clamp-1 " + (collection.hideIdFromForm ? "mb-6" : "")}
                    variant={"h4"}>
                    {title ?? collection.singularName ?? collection.name}
                </Typography>

                {!entity?.values && initialStatus === "existing" &&
                    <Alert color={"warning"} size={"small"} outerClassName={"w-full mb-4 text-xs"}>
                        {t("entity_does_not_exist")}
                    </Alert>}

                {showEntityPath && <Alert color={"base"} outerClassName={"w-full"} size={"small"}>
                    <code
                        className={"text-xs select-all text-text-secondary dark:text-text-secondary-dark"}>
                        {entity?.path ?? path}/{entityId}
                    </code>
                </Alert>}
            </div>}

            {children}

            {initialEntityId && !entity && initialStatus !== "new" && <Alert color={"info"} size={"small"}>
                {t("entity_does_not_exist")}
            </Alert>}

            {formContext && <>
                <div className="mt-12 flex flex-col gap-8" ref={formRef}>
                    {formFields()}
                    <ErrorFocus containerRef={formRef} />
                </div>
            </>}

            {forceActionsAtTheBottom && <div className="h-16" />}
        </>
    </ErrorBoundary>;

    useEffect(() => {
        if (entityId && onIdChange)
            onIdChange(entityId);
    }, [entityId, onIdChange]);

    if (!collection || !path) {
        throw Error("INTERNAL: Collection and path must be defined in form context");
    }

    const dialogActions = <EntityFormActionsComponent
        collection={collection}
        path={path}
        entity={entity}
        layout={forceActionsAtTheBottom ? "bottom" : "side"}
        savingError={savingError}
        formex={formex}
        disabled={actionsDisabled}
        status={status}
        pluginActions={pluginActions ?? []}
        openEntityMode={openEntityMode}
        showDefaultActions={showDefaultActions}
        navigateBack={navigateBack}
        formContext={formContext}
    />;

    return (
        <Formex value={formex}>
            <form
                onSubmit={formex.handleSubmit}
                onReset={() => formex.resetForm({
                    values: baseInitialValues as M
                })}
                noValidate
                className={cls("flex-1 flex flex-row w-full overflow-y-auto justify-center", className)}>
                <div
                    id={`form_${path}`}
                    className={cls("relative flex flex-row max-w-4xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl w-full h-fit")}>

                    <div className={cls("flex flex-col w-full pt-12 pb-16 px-4 sm:px-8 md:px-10")}>
                        <div
                            className={"flex flex-row gap-4 self-end sticky top-4 z-10"}>

                            {manualApplyLocalChanges && hasLocalChanges &&
                                <LocalChangesMenu<M>
                                    cacheKey={status === "new" || status === "copy" ? path + "#new" : path + "/" + entityId}
                                    properties={collection.properties}
                                    cachedData={localChangesData as Partial<M>}
                                    formex={formex}
                                    onClearLocalChanges={() => setLocalChangesCleared(true)}
                                />}

                            {formex.dirty
                                ? <Tooltip title={t("form_modified")}>
                                    <Chip size={"small"} className={"py-1"} colorScheme={"orangeDarker"}>
                                        <EditIcon size={"smallest"} />
                                    </Chip>
                                </Tooltip>
                                : <Tooltip title={t("form_in_sync")}>
                                    <Chip size={"small"} className={"py-1"}>
                                        <CheckIcon size={"smallest"} />
                                    </Chip>
                                </Tooltip>}
                        </div>

                        {formView}

                    </div>

                </div>

                {dialogActions}

            </form>

        </Formex>
    );
}

export function getInitialEntityValues<M extends object>(
    authController: AuthController,
    collection: EntityCollection,
    path: string,
    status: "new" | "existing" | "copy",
    entity: Entity<M> | undefined,
    propertyConfigs?: Record<string, PropertyConfig>,
): Partial<EntityValues<M>> {
    const properties = collection.properties;
    if ((status === "existing" || status === "copy") && entity) {
        if (!collection.alwaysApplyDefaultValues) {
            return entity.values ?? getDefaultValuesFor(properties);
        } else {
            const defaultValues = getDefaultValuesFor(properties);
            return mergeDeep(defaultValues, entity.values ?? {});
        }
    } else if (status === "new") {
        return getDefaultValuesFor(properties);
    } else {
        console.error({
            status,
            entity
        });
        throw new Error("Form has not been initialised with the correct parameters");
    }
}

export function yupToFormErrors(yupError: ValidationError): Record<string, any> {
    let errors: Record<string, any> = {};
    if (yupError.inner) {
        if (yupError.inner.length === 0) {
            return setIn(errors, yupError.path!, yupError.message);
        }
        for (const err of yupError.inner) {
            if (!getIn(errors, err.path!)) {
                errors = setIn(errors, err.path!, err.message);
            }
        }
    }
    return errors;
}

function useOnAutoSave(autoSave: undefined | boolean, formex: FormexController<any>, lastSavedValues: any, save: (values: EntityValues<any>) => Promise<Entity<any> | void>) {
    if (!autoSave) return;
    useEffect(() => {
        if (autoSave) {
            if (formex.values && !equal(formex.values, lastSavedValues.current)) {
                save(formex.values);
            }
        }
    }, [formex.values]);
}

