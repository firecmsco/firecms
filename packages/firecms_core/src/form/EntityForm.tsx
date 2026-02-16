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
    ResolvedEntityCollection
} from "../types";
import equal from "react-fast-compare";

import { ErrorBoundary, getFormFieldKeys } from "../components";
import {
    getDefaultValuesFor,
    getEntityTitlePropertyKey,
    getLocalChangesBackup,
    getValueInPath,
    isHidden,
    isObject,
    isReadOnly,
    mergeDeep,
    resolveCollection,
    useDebouncedCallback
} from "../util";

import {
    saveEntityWithCallbacks,
    useAuthController,
    useCustomizationController,
    useDataSource,
    useFireCMSContext,
    useNavigationController,
    useSideEntityController,
    useSnackbarController
} from "../hooks";
import { Alert, CheckIcon, Chip, cls, EditIcon, NotesIcon, paperMixin, Tooltip, Typography } from "@firecms/ui";
import { Formex, FormexController, getIn, setIn, useCreateFormex } from "@firecms/formex";
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
import { CustomIdField } from "./components/CustomIdField";
import { ErrorFocus } from "./components/ErrorFocus";
import { CustomFieldValidator, getYupEntitySchema } from "./validation";
import { EntityFormActions, EntityFormActionsProps } from "./EntityFormActions";
import { LocalChangesMenu } from "./components/LocalChangesMenu";

export type OnUpdateParams = {
    entity: Entity<any>,
    status: EntityStatus,
    path: string,
    entityId?: string;
    selectedTab?: string;
    collection: EntityCollection<any>
};

export type EntityFormProps<M extends Record<string, any>> = {
    path: string;
    fullIdPath?: string;
    collection: EntityCollection<M>;
    entityId?: string;
    entity?: Entity<M>;
    databaseId?: string;
    onIdChange?: (id: string) => void;
    onValuesModified?: (modified: boolean, values: M) => void;
    onSaved?: (params: OnUpdateParams) => void;
    initialDirtyValues?: Partial<M>; // dirty cached entity in memory
    onFormContextReady?: (formContext: FormContext) => void;
    forceActionsAtTheBottom?: boolean;
    className?: string;
    initialStatus: EntityStatus;
    onStatusChange?: (status: EntityStatus) => void;
    onEntityChange?: (entity: Entity<M>) => void;
    formex?: FormexController<M>;
    openEntityMode?: "side_panel" | "full_screen";
    /**
     * If true, the form will be disabled and no actions will be available
     */
    disabled?: boolean;
    /**
     * Include the copy and delete actions in the form
     */
    showDefaultActions?: boolean;

    /**
     * Display the entity path in the form
     */
    showEntityPath?: boolean;

    EntityFormActionsComponent?: React.FC<EntityFormActionsProps>;

    Builder?: React.ComponentType<EntityCustomViewParams<M>>;

    children?: React.ReactNode;
};

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
    fullIdPath,
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

    if (collection.customId && collection.formAutoSave) {
        console.warn(`The collection ${collection.path} has customId and formAutoSave enabled. This is not supported and formAutoSave will be ignored`);
    }

    const sideEntityController = useSideEntityController();
    const navigationController = useNavigationController();

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
    const context = useFireCMSContext();
    const analyticsController = useAnalyticsController();

    const [underlyingChanges] = useState<Partial<EntityValues<M>>>({});

    const [customIdLoading, setCustomIdLoading] = useState<boolean>(false);

    const mustSetCustomId: boolean = (status === "new" || status === "copy") &&
        (Boolean(collection.customId) && collection.customId !== "optional");

    const initialEntityId: string | undefined = useMemo((): string | undefined => {
        if (status === "new" || status === "copy") {
            if (mustSetCustomId) {
                return undefined;
            } else {
                return dataSource.generateEntityId(path, collection);
            }
        } else {
            return entityIdProp;
        }
    }, [entityIdProp, status]);

    const [entityId, setEntityId] = useState<string | undefined>(initialEntityId);
    const [entityIdError, setEntityIdError] = useState<boolean>(false);
    const [savingError, setSavingError] = useState<Error | undefined>();

    const autoSave = collection.formAutoSave && !collection.customId;

    const baseInitialValues = useMemo(() => getInitialEntityValues(authController, collection, path, status, entity, customizationController.propertyConfigs), [authController, collection, path, status, entity, customizationController.propertyConfigs]);

    const localChangesDataRaw = useMemo(() => entityId
        ? getEntityFromCache(path + "/" + entityId)
        : getEntityFromCache(path + "#new"), [entityId, path]);

    const [localChangesCleared, setLocalChangesCleared] = useState<boolean>(false);

    const localChangesBackup = getLocalChangesBackup(collection);
    const autoApplyLocalChanges = localChangesBackup === "auto_apply";
    const manualApplyLocalChanges = localChangesBackup === "manual_apply";

    const onSubmit = (values: EntityValues<M>, formexController: FormexController<EntityValues<M>>) => {

        if (mustSetCustomId && !entityId) {
            console.error("Missing custom Id");
            setEntityIdError(true);
            formexController.setSubmitting(false);
            return;
        }

        setSavingError(undefined);
        setEntityIdError(false);

        if (status === "existing") {
            if (!entity?.id) throw Error("Form misconfiguration when saving, no id for existing entity");
        } else if (status === "new" || status === "copy") {
            if (collection.customId) {
                if (collection.customId !== "optional" && !entityId) {
                    throw Error("Form misconfiguration when saving, entityId should be set");
                }
            }
        } else {
            throw Error("New FormType added, check EntityForm");
        }

        return save(values)
            ?.then(_ => {
                formexController.resetForm({
                    values,
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

    const hasLocalChanges = !localChangesCleared && localChangesDataRaw && Object.keys(localChangesDataRaw).length > 0;

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
        validation: (values) => {
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

    const resolvedCollection = useMemo(() => resolveCollection<M>({
        collection,
        path,
        entityId,
        values: formex.values,
        previousValues: formex.initialValues,
        propertyConfigs: customizationController.propertyConfigs,
        authController
    }), [collection, path, entityId, formex.values, formex.initialValues, customizationController.propertyConfigs]);

    const onPreSaveHookError = useCallback((e: Error) => {
        snackbarController.open({
            type: "error",
            message: "Error before saving: " + e?.message
        });
        console.error(e);
    }, [snackbarController]);

    const onSaveSuccessHookError = useCallback((e: Error) => {
        snackbarController.open({
            type: "error",
            message: "Error after saving (entity is saved): " + e?.message
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

    const onSaveSuccess = (updatedEntity: Entity<M>) => {

        clearDirtyCache();
        onValuesModified?.(false, updatedEntity.values);
        if (!autoSave)
            snackbarController.open({
                type: "success",
                message: `${collection.singularName ?? collection.name}: Saved correctly`
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

    const onSaveFailure = useCallback((e: Error) => {
        snackbarController.open({
            type: "error",
            message: "Error saving: " + e?.message
        });
        console.error("Error saving entity", path, entityId);
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
        entityId: string | undefined,
        values: M,
        previousValues?: M,
    }) => {
        return saveEntityWithCallbacks({
            path,
            entityId,
            values,
            previousValues,
            collection,
            status,
            dataSource,
            context,
            onSaveSuccess,
            onSaveFailure,
            onPreSaveHookError,
            onSaveSuccessHookError
        }).then();
    };

    type EntityFormSaveParams<M extends Record<string, any>> = {
        collection: ResolvedEntityCollection<M>,
        path: string,
        entityId: string | undefined,
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
    }: EntityFormSaveParams<M>): Promise<void> => {
        if (!status)
            return;
        if (autoSave) {
            setValuesToBeSaved(values);
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
    const save = (values: EntityValues<M>): Promise<void> => {
        lastSavedValues.current = values;
        return onSaveEntityRequest({
            collection: resolvedCollection,
            path,
            entityId,
            values,
            previousValues: entity?.values,
            autoSave: autoSave ?? false
        }).then(() => {
            const eventName: CMSAnalyticsEvent = status === "new"
                ? "new_entity_saved"
                : (status === "copy" ? "entity_copied" : (status === "existing" ? "entity_edited" : "unmapped_event"));
            analyticsController.onAnalyticsEvent?.(eventName, { path });
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
        collection: resolvedCollection,
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
    }, [formex.version, resolvedCollection, entityId, path]);

    const onIdUpdateError = useCallback((error: any) => {
        snackbarController.open({
            type: "error",
            message: "Error updating id, check the console"
        });
        console.error(error);
    }, [snackbarController]);

    const pluginActions: React.ReactNode[] = [];
    const pluginBeforeTitle: React.ReactNode[] = [];
    const plugins = customizationController.plugins;

    const actionsDisabled = disabled || formex.isSubmitting || (status === "existing" && !formex.dirty) || Boolean(disabledProp);
    const parentCollectionIds = navigationController.getParentCollectionIds(path);

    if (plugins && collection) {
        const actionProps: PluginFormActionProps = {
            entityId,
            parentCollectionIds,
            path,
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
        pluginBeforeTitle.push(...plugins.map((plugin) => (
            plugin.form?.BeforeTitle
                ? <plugin.form.BeforeTitle
                    key={`before_title_${plugin.key}`} {...actionProps} />
                : null
        )).filter(Boolean));
    }

    const titlePropertyKey = getEntityTitlePropertyKey(resolvedCollection, customizationController.propertyConfigs);
    const title = (formex.values && titlePropertyKey ? getValueInPath(formex.values, titlePropertyKey) : undefined)
        ?? collection.singularName
        ?? collection.name;

    const onIdUpdate = collection.callbacks?.onIdUpdate;
    const doOnIdUpdate = useCallback(async () => {
        if (onIdUpdate && formex.values && (status === "new" || status === "copy")) {
            setCustomIdLoading(true);
            try {
                const updatedId = await onIdUpdate({
                    collection: resolvedCollection,
                    path,
                    entityId,
                    values: formex.values,
                    context
                });
                setEntityId(updatedId);
            } catch (e) {
                onIdUpdateError?.(e);
                console.error(e);
            }
            setCustomIdLoading(false);
        }
    }, [entityId, formex.values, status, onIdUpdate, resolvedCollection, path, context, onIdUpdateError]);

    useEffect(() => {
        doOnIdUpdate();
    }, [doOnIdUpdate]);

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

    const validationSchema = useMemo(() => entityId
        ? getYupEntitySchema(
            entityId,
            resolvedCollection.properties,
            uniqueFieldValidator)
        : undefined,
        [entityId, resolvedCollection.properties, uniqueFieldValidator]);

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

    const formFieldKeys = getFormFieldKeys(resolvedCollection);

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
                    const property = resolvedCollection.properties[key];
                    if (property) {
                        const underlyingValueHasChanged: boolean =
                            !!underlyingChanges &&
                            Object.keys(underlyingChanges).includes(key) &&
                            formex.touched[key];
                        const disabled = disabledProp || (!autoSave && formex.isSubmitting) || isReadOnly(property) || Boolean(property.disabled);
                        const hidden = isHidden(property);
                        if (hidden) return null;
                        const widthPercentage = property.widthPercentage ?? 100;
                        const cmsFormFieldProps: PropertyFieldBindingProps<any, M> = {
                            propertyKey: key,
                            disabled,
                            property,
                            includeDescription: property.description || property.longDescription,
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

                    const additionalField = resolvedCollection.additionalFields?.find(f => f.key === key);
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

                    console.warn(`Property ${key} not found in collection ${resolvedCollection.name} in properties or additional fields. Skipping.`);
                    return null;
                }).filter(Boolean)}
            </FormLayout>
        );
    };

    const formRef = useRef<HTMLDivElement>(null);

    const formView = <ErrorBoundary>
        <>
            {pluginBeforeTitle}

            {!Builder && <div className={"w-full py-2 flex flex-col items-start my-4 lg:my-6"}>
                <Typography
                    className={"my-4 flex-grow line-clamp-1 " + (collection.hideIdFromForm ? "mb-6" : "")}
                    variant={"h4"}>
                    {title ?? collection.singularName ?? collection.name}
                </Typography>

                {!entity?.values && initialStatus === "existing" &&
                    <Alert color={"warning"} size={"small"} outerClassName={"w-full mb-4 text-xs"}>
                        This entity does not exist in the database
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
                This entity does not exist in the database
            </Alert>}

            {!Builder && !collection.hideIdFromForm &&
                <CustomIdField customId={collection.customId}
                    entityId={entityId}
                    status={status}
                    onChange={setEntityId}
                    error={entityIdError}
                    loading={customIdLoading}
                    entity={entity} />
            }

            {entityId && formContext && <>
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

    if (!resolvedCollection || !path) {
        throw Error("INTERNAL: Collection and path must be defined in form context");
    }

    const dialogActions = <EntityFormActionsComponent
        collection={resolvedCollection}
        path={path}
        fullPath={path}
        fullIdPath={fullIdPath}
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
                                <LocalChangesMenu
                                    cacheKey={status === "new" || status === "copy" ? path + "#new" : path + "/" + entityId}
                                    properties={resolvedCollection.properties}
                                    cachedData={localChangesDataRaw as Partial<M>}
                                    formex={formex}
                                    onClearLocalChanges={() => setLocalChangesCleared(true)}
                                />}

                            {formex.dirty
                                ? <Tooltip title={"This form has been modified"}>
                                    <Chip size={"small"} className={"py-1"} colorScheme={"orangeDarker"}>
                                        <EditIcon size={"smallest"} />
                                    </Chip>
                                </Tooltip>
                                : <Tooltip title={"The current form is in sync with the database"}>
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
    const resolvedCollection = resolveCollection({
        collection,
        path,
        values: entity?.values,
        propertyConfigs,
        authController
    });
    const properties = resolvedCollection.properties;
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

function useOnAutoSave(autoSave: undefined | boolean, formex: FormexController<any>, lastSavedValues: any, save: (values: EntityValues<any>) => Promise<void>) {
    if (!autoSave) return;
    useEffect(() => {
        if (autoSave) {
            if (formex.values && !equal(formex.values, lastSavedValues.current)) {
                save(formex.values);
            }
        }
    }, [formex.values]);
}

