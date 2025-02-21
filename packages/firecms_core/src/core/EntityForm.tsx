import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
    CMSAnalyticsEvent,
    Entity,
    EntityAction,
    EntityCollection,
    EntityStatus,
    EntityValues,
    FireCMSContext,
    FormContext,
    PluginFormActionProps,
    PropertyFieldBindingProps,
    ResolvedEntityCollection,
    SideEntityController
} from "../types";
import equal from "react-fast-compare";

import { copyEntityAction, deleteEntityAction, ErrorBoundary, getFormFieldKeys } from "../components";
import {
    canCreateEntity,
    canDeleteEntity,
    getDefaultValuesFor,
    getEntityTitlePropertyKey,
    getValueInPath,
    isHidden,
    isReadOnly,
    mergeEntityActions,
    resolveCollection,
    useDebouncedCallback
} from "../util";

import {
    saveEntityWithCallbacks,
    useAuthController,
    useCustomizationController,
    useDataSource,
    useFireCMSContext,
    useSideEntityController,
    useSnackbarController
} from "../hooks";
import {
    Alert,
    Button,
    CheckIcon,
    Chip,
    cls,
    defaultBorderMixin,
    DialogActions,
    EditIcon,
    IconButton,
    LoadingButton,
    NotesIcon,
    paperMixin,
    Tooltip,
    Typography
} from "@firecms/ui";
import { Formex, FormexController, getIn, setIn, useCreateFormex } from "@firecms/formex";
import { useAnalyticsController } from "../hooks/useAnalyticsController";
import { FormEntry, FormLayout, LabelWithIconAndTooltip, PropertyFieldBinding } from "../form";
import { ValidationError } from "yup";
import { removeEntityFromCache, saveEntityToCache } from "../util/entity_cache";
import { CustomIdField } from "../form/components/CustomIdField";
import { ErrorFocus } from "../form/components/ErrorFocus";
import { CustomFieldValidator, getYupEntitySchema } from "../form/validation";

export type OnUpdateParams = {
    entity: Entity<any>,
    status: EntityStatus,
    path: string,
    entityId?: string;
    selectedTab?: string;
    collection: EntityCollection<any>
};

type EntityFormProps<M extends Record<string, any>> = {
    path: string;
    collection: EntityCollection<M>;
    entityId?: string;
    entity?: Entity<M>;
    databaseId?: string;
    onIdChange?: (id: string) => void;
    onValuesModified?: (modified: boolean) => void;
    onSaved?: (params: OnUpdateParams) => void;
    onClose?: () => void;
    cachedDirtyValues?: Partial<M>; // dirty cached entity in memory
    onFormContextReady?: (formContext: FormContext) => void;
    forceActionsAtTheBottom?: boolean;
    initialStatus: EntityStatus;
    className?: string;
    onStatusChange?: (status: EntityStatus) => void;
    onEntityChange?: (entity: Entity<M>) => void;
    formex?: FormexController<M>;
    openEntityMode?: "side_panel" | "full_screen";
};

export function EntityForm<M extends Record<string, any>>({
                                                              path,
                                                              entityId: entityIdProp,
                                                              collection,
                                                              onValuesModified,
                                                              onIdChange,
                                                              onSaved,
                                                              onClose,
                                                              entity,
                                                              cachedDirtyValues,
                                                              onFormContextReady,
                                                              forceActionsAtTheBottom,
                                                              initialStatus,
                                                              className,
                                                              onStatusChange,
                                                              onEntityChange,
                                                              openEntityMode = "full_screen",
                                                              formex: formexProp
                                                          }: EntityFormProps<M>) {

    if (collection.customId && collection.formAutoSave) {
        console.warn(`The collection ${collection.path} has customId and formAutoSave enabled. This is not supported and formAutoSave will be ignored`);
    }

    const [status, setStatus] = useState<EntityStatus>(initialStatus);
    const [saving, setSaving] = useState(false);

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
                values: valuesToBeSaved,
                closeAfterSave: false
            });
    }, false, 2000);

    const authController = useAuthController();
    const dataSource = useDataSource(collection);
    const sideEntityController = useSideEntityController();
    const snackbarController = useSnackbarController();
    const customizationController = useCustomizationController();
    const context = useFireCMSContext();
    const closeAfterSaveRef = useRef(false);
    const analyticsController = useAnalyticsController();

    const [underlyingChanges, setUnderlyingChanges] = useState<Partial<EntityValues<M>>>({});

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

    const formex: FormexController<M> = formexProp ?? useCreateFormex<M>({
        initialValues: (cachedDirtyValues ?? getInitialEntityValues(collection, path, status, entity)) as M,
        initialDirty: Boolean(cachedDirtyValues),
        onSubmit,
        onReset: () => {
            clearDirtyCache();
            onValuesModified?.(false);
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

    const resolvedCollection = useMemo(() => resolveCollection<M>({
        collection,
        path,
        entityId,
        values: formex.values,
        previousValues: formex.initialValues,
        propertyConfigs: customizationController.propertyConfigs
    }), [collection, path, entityId, formex.values, formex.initialValues, customizationController.propertyConfigs]);

    const onPreSaveHookError = useCallback((e: Error) => {
        setSaving(false);
        snackbarController.open({
            type: "error",
            message: "Error before saving: " + e?.message
        });
        console.error(e);
    }, [snackbarController]);

    const onSaveSuccessHookError = useCallback((e: Error) => {
        setSaving(false);
        snackbarController.open({
            type: "error",
            message: "Error after saving (entity is saved): " + e?.message
        });
        console.error(e);
    }, [snackbarController]);

    function clearDirtyCache() {
        if (status === "new" || status === "copy") {
            removeEntityFromCache(path + "#new");
        } else {
            removeEntityFromCache(path + "/" + entityId);
        }
    }

    const onSaveSuccess = (updatedEntity: Entity<M>, closeAfterSave: boolean) => {

        clearDirtyCache();
        onValuesModified?.(false);
        setSaving(false);
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

        if (closeAfterSave) {
            onClose?.();
        }
    };

    const onSaveFailure = useCallback((e: Error) => {
        setSaving(false);
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
                            closeAfterSave,
                            entityId,
                            collection,
                            path
                        }: {
        collection: EntityCollection<M>,
        path: string,
        entityId: string | undefined,
        values: M,
        previousValues?: M,
        closeAfterSave: boolean,
    }) => {
        setSaving(true);
        return saveEntityWithCallbacks({
            path,
            entityId,
            values,
            previousValues,
            collection,
            status,
            dataSource,
            context,
            onSaveSuccess: (updatedEntity: Entity<M>) => onSaveSuccess(updatedEntity, closeAfterSave),
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
        closeAfterSave: boolean,
        autoSave: boolean
    };

    const onSaveEntityRequest = async ({
                                           collection,
                                           path,
                                           entityId,
                                           values,
                                           previousValues,
                                           closeAfterSave,
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
                previousValues,
                closeAfterSave
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
            closeAfterSave: closeAfterSaveRef.current,
            autoSave: autoSave ?? false
        }).then(_ => {
            const eventName: CMSAnalyticsEvent = status === "new"
                ? "new_entity_saved"
                : (status === "copy" ? "entity_copied" : (status === "existing" ? "entity_edited" : "unmapped_event"));
            analyticsController.onAnalyticsEvent?.(eventName, { path });
        }).catch(e => {
            console.error(e);
            setSavingError(e);
        }).finally(() => {
            closeAfterSaveRef.current = false;
        });
    };

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
        setPendingClose: (value: boolean) => {
            closeAfterSaveRef.current = value;
        }
    };

    useEffect(() => {
        onFormContextReady?.(formContext);
    }, [formex.version, resolvedCollection, entityId, path]);

    const onIdUpdateError = useCallback((error: any) => {
        snackbarController.open({
            type: "error",
            message: "Error updating id, check the console"
        });
    }, []);

    const pluginActions: React.ReactNode[] = [];
    const plugins = customizationController.plugins;

    if (plugins && collection) {
        const actionProps: PluginFormActionProps = {
            entityId,
            path,
            status,
            collection: collection,
            context,
            currentEntityId: entityId,
            formContext,
            openEntityMode
        };
        pluginActions.push(...plugins.map((plugin) => (
            plugin.form?.Actions
                ? <plugin.form.Actions
                    key={`actions_${plugin.key}`} {...actionProps} />
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
            onValuesModified?.(modified);
        }
    }, [formex.dirty]);

    const deferredValues = useDeferredValue(formex.values);
    const modified = formex.dirty;

    const uniqueFieldValidator: CustomFieldValidator = useCallback(({
                                                                        name,
                                                                        value,
                                                                        property
                                                                    }) => dataSource.checkUniqueField(path, name, value, entityId, collection),
        [dataSource, path, entityId]);

    const validationSchema = useMemo(() => entityId
            ? getYupEntitySchema(
                entityId,
                resolvedCollection.properties,
                uniqueFieldValidator)
            : undefined,
        [entityId, resolvedCollection.properties, uniqueFieldValidator]);

    useEffect(() => {
        const key = (status === "new" || status === "copy") ? path + "#new" : path + "/" + entityId;
        if (modified) {
            saveEntityToCache(key, deferredValues);
        }
    }, [deferredValues, modified, path, entityId, status]);

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

    const formFields = () => (
            <FormLayout>
                {formFieldKeys.map((key) => {
                    const property = resolvedCollection.properties[key];
                    if (property) {
                        const underlyingValueHasChanged: boolean =
                            !!underlyingChanges &&
                            Object.keys(underlyingChanges).includes(key) &&
                            formex.touched[key];
                        const disabled = (!autoSave && formex.isSubmitting) || isReadOnly(property) || Boolean(property.disabled);
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
                            ? <Builder entity={entity} context={context}/>
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
                                    icon={<NotesIcon size={"small"}/>}
                                    title={additionalField.name}
                                    className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>
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
        )
    ;

    const formRef = useRef<HTMLDivElement>(null);

    const formView = <ErrorBoundary>
        <>
            <div className={"w-full py-2 flex flex-col items-start mt-4 lg:mt-8 mb-8"}>
                <Typography
                    className={"py-4 flex-grow line-clamp-1 " + (collection.hideIdFromForm ? "mb-2" : "mb-0")}
                    variant={"h4"}>
                    {title ?? collection.singularName ?? collection.name}
                </Typography>
                <Alert color={"base"} className={"w-full"} size={"small"}>
                    <code
                        className={"text-xs select-all text-text-secondary dark:text-text-secondary-dark"}>
                        {entity?.path ?? path}/{entityId}
                    </code>
                </Alert>
            </div>

            {!collection.hideIdFromForm &&
                <CustomIdField customId={collection.customId}
                               entityId={entityId}
                               status={status}
                               onChange={setEntityId}
                               error={entityIdError}
                               loading={customIdLoading}
                               entity={entity}/>
            }

            {entityId && formContext && <>
                <div className="mt-12 flex flex-col gap-8" ref={formRef}>
                    {formFields()}
                    <ErrorFocus containerRef={formRef}/>
                </div>
            </>}

            {forceActionsAtTheBottom && <div className="h-16"/>}
        </>
    </ErrorBoundary>;

    useEffect(() => {
        if (entityId && onIdChange)
            onIdChange(entityId);
    }, [entityId, onIdChange]);

    return (
        <FormLayoutInner
            className={className}
            id={`form_${path}`}
            pluginActions={pluginActions}
            forceActionsAtTheBottom={forceActionsAtTheBottom}
            formContext={formContext}>
            {formView}
        </FormLayoutInner>
    );
}

function getInitialEntityValues<M extends object>(
    collection: EntityCollection,
    path: string,
    status: "new" | "existing" | "copy",
    entity: Entity<M> | undefined
): Partial<EntityValues<M>> {
    const resolvedCollection = resolveCollection({
        collection,
        path,
        values: entity?.values,
    });
    const properties = resolvedCollection.properties;
    if ((status === "existing" || status === "copy") && entity) {
        return entity.values ?? getDefaultValuesFor(properties);
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

export function FormLayoutInner<M extends object>({
                                                      id,
                                                      formContext,
                                                      children,
                                                      className,
                                                      forceActionsAtTheBottom,
                                                      pluginActions
                                                  }: {
    id?: string,
    formContext: FormContext,
    children: React.ReactNode,
    className?: string,
    forceActionsAtTheBottom?: boolean,
    pluginActions?: React.ReactNode[],
}) {

    const context = useFireCMSContext();
    const sideEntityController = useSideEntityController();
    const authController = useAuthController();

    const formex = formContext.formex;
    const collection = formContext.collection;
    const path = formContext.path;
    const entity = formContext.entity;
    const savingError = formContext.savingError;
    const status = formContext.status;
    const openEntityMode = formContext.openEntityMode;
    const setPendingClose = formContext.setPendingClose;
    const disabled = formex.isSubmitting || (!formex.dirty && status === "existing");

    if (!collection || !path) {
        throw Error("INTERNAL: Collection and path must be defined in form context");
    }

    const getActionsForEntity = useCallback(({
                                                 entity,
                                                 customEntityActions
                                             }: {
        entity?: Entity<M>,
        customEntityActions?: EntityAction[]
    }): EntityAction[] => {

        const createEnabled = canCreateEntity(collection, authController, path, null);
        const deleteEnabled = entity ? canDeleteEntity(collection, authController, path, entity) : false;
        const actions: EntityAction[] = [];
        if (createEnabled)
            actions.push(copyEntityAction);
        if (deleteEnabled)
            actions.push(deleteEntityAction);
        if (customEntityActions)
            return mergeEntityActions(actions, customEntityActions);
        return actions;
    }, [authController, collection, path]);

    const entityActions = getActionsForEntity({
        entity,
        customEntityActions: collection.entityActions
    });
    const formActions = entityActions.filter(a => a.includeInForm === undefined || a.includeInForm);

    const dialogActions = forceActionsAtTheBottom
        ? buildBottomActions({
            savingError,
            entity,
            formActions,
            collection,
            context,
            sideEntityController,
            isSubmitting: formex.isSubmitting,
            disabled,
            status,
            setPendingClose,
            pluginActions,
            openEntityMode
        })
        : buildSideActions({
            savingError,
            entity,
            formActions,
            collection,
            context,
            sideEntityController,
            isSubmitting: formex.isSubmitting,
            disabled,
            status,
            pluginActions,
            openEntityMode
        });

    return (
        <Formex value={formContext.formex}>
            <form
                onSubmit={formContext.formex.handleSubmit}
                onReset={() => formex.resetForm({
                    values: getInitialEntityValues(collection, path, status, entity),
                })}
                noValidate
                className={cls("flex-1 flex flex-row w-full overflow-y-auto justify-center", className)}>
                <div
                    id={id}
                    className={cls("relative flex flex-row max-w-4xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-6xl w-full h-fit")}>

                    <div className={cls("flex flex-col w-full pt-12 pb-16 px-4 sm:px-8 md:px-10")}>

                        {formContext.formex.dirty
                            ? <Tooltip title={"Unsaved changes"}
                                       className={"self-end sticky top-4 z-10"}>
                                <Chip size={"small"} colorScheme={"orangeDarker"}>
                                    <EditIcon size={"smallest"}/>
                                </Chip>
                            </Tooltip>
                            : <Tooltip title={"In sync with the database"}
                                       className={"self-end sticky top-4 z-10"}>
                                <Chip size={"small"}>
                                    <CheckIcon size={"smallest"}/>
                                </Chip>
                            </Tooltip>}
                        {children}

                    </div>

                </div>
                {dialogActions}
            </form>

        </Formex>
    );
}

type ActionsViewProps<M extends object> = {
    savingError: Error | undefined,
    entity: Entity<M> | undefined,
    formActions: EntityAction[],
    collection: ResolvedEntityCollection,
    context: FireCMSContext,
    sideEntityController: SideEntityController,
    isSubmitting: boolean,
    disabled: boolean,
    status: "new" | "existing" | "copy",
    setPendingClose?: (value: boolean) => void,
    pluginActions?: React.ReactNode[],
    openEntityMode: "side_panel" | "full_screen";
};

function buildBottomActions<M extends object>({
                                                  savingError,
                                                  entity,
                                                  formActions,
                                                  collection,
                                                  context,
                                                  sideEntityController,
                                                  isSubmitting,
                                                  disabled,
                                                  status,
                                                  setPendingClose,
                                                  pluginActions,
                                                  openEntityMode
                                              }: ActionsViewProps<M>) {

    const canClose = openEntityMode === "side_panel";
    return <DialogActions position={"absolute"}>
        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }
        {entity && formActions.length > 0 && <div className="flex-grow flex overflow-auto no-scrollbar">
            {formActions.map(action => (
                <IconButton
                    key={action.name}
                    color="primary"
                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                        event.stopPropagation();
                        if (entity)
                            action.onClick({
                                entity,
                                fullPath: collection.path,
                                collection: collection,
                                context,
                                sideEntityController,
                                openEntityMode: openEntityMode
                            });
                    }}>
                    {action.icon}
                </IconButton>
            ))}
        </div>}
        {pluginActions}
        <Button variant="text" disabled={disabled || isSubmitting} type="reset">
            {status === "existing" ? "Discard" : "Clear"}
        </Button>
        <Button variant={canClose ? "text" : "filled"} color="primary" type="submit"
                disabled={disabled || isSubmitting}
                onClick={() => {
                    setPendingClose?.(false);
                }}>
            {status === "existing" && "Save"}
            {status === "copy" && "Create copy"}
            {status === "new" && "Create"}
        </Button>
        {canClose && <LoadingButton variant="filled"
                                    color="primary"
                                    type="submit"
                                    loading={isSubmitting}
                                    disabled={disabled}
                                    onClick={() => {
                                        setPendingClose?.(true);
                                    }}>
            {status === "existing" && "Save and close"}
            {status === "copy" && "Create copy and close"}
            {status === "new" && "Create and close"}
        </LoadingButton>}
    </DialogActions>;
}

function buildSideActions<M extends object>({
                                                savingError,
                                                entity,
                                                formActions,
                                                collection,
                                                context,
                                                sideEntityController,
                                                isSubmitting,
                                                disabled,
                                                status,
                                                setPendingClose,
                                                pluginActions
                                            }: ActionsViewProps<M>) {

    return <div
        className={cls("overflow-auto h-full flex flex-col gap-2 w-80 2xl:w-96 px-4 py-16 sticky top-0 border-l", defaultBorderMixin)}>
        <LoadingButton fullWidth={true} variant="filled" color="primary" type="submit" size={"large"}
                       disabled={disabled || isSubmitting} onClick={() => {
            setPendingClose?.(false);
        }}>
            {status === "existing" && "Save"}
            {status === "copy" && "Create copy"}
            {status === "new" && "Create"}
        </LoadingButton>
        <Button fullWidth={true} variant="text" disabled={disabled || isSubmitting} type="reset">
            {status === "existing" ? "Discard" : "Clear"}
        </Button>

        {pluginActions}

        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>{savingError.message}</Typography>
            </div>
        }
    </div>;
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
