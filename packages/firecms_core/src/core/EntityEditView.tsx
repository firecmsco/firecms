import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    CMSAnalyticsEvent,
    Entity,
    EntityAction,
    EntityCollection,
    EntityCustomView,
    EntityStatus,
    EntityValues,
    FireCMSPlugin,
    FormContext,
    PluginFormActionProps,
    PropertyFieldBindingProps,
    ResolvedEntityCollection,
    User
} from "../types";
import equal from "react-fast-compare"

import {
    CircularProgressCenter,
    copyEntityAction,
    deleteEntityAction,
    EntityCollectionView,
    EntityView,
    ErrorBoundary,
    getFormFieldKeys,
} from "../components";
import {
    canCreateEntity,
    canDeleteEntity,
    canEditEntity,
    getDefaultValuesFor,
    getEntityTitlePropertyKey,
    getValueInPath,
    isHidden,
    isReadOnly,
    removeInitialAndTrailingSlashes,
    resolveCollection,
    resolveDefaultSelectedView,
    resolveEntityView,
    useDebouncedCallback
} from "../util";

import {
    saveEntityWithCallbacks,
    useAuthController,
    useCustomizationController,
    useDataSource,
    useEntityFetch,
    useFireCMSContext,
    useSideEntityController,
    useSnackbarController
} from "../hooks";
import {
    Alert,
    Button,
    CircularProgress,
    CloseIcon,
    cls,
    defaultBorderMixin,
    DialogActions,
    IconButton,
    NotesIcon,
    paperMixin,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from "@firecms/ui";
import { useSideDialogContext } from "./index";
import { Formex, FormexController, getIn, setIn, useCreateFormex } from "@firecms/formex";
import { useAnalyticsController } from "../hooks/useAnalyticsController";
import { CustomIdField } from "../form/components/CustomIdField";
import { CustomFieldValidator, getYupEntitySchema } from "../form/validation";
import { ErrorFocus } from "../form/components/ErrorFocus";
import { PropertyIdCopyTooltipContent } from "../components/PropertyIdCopyTooltipContent";
import { LabelWithIcon, PropertyFieldBinding } from "../form";
import { ValidationError } from "yup";

const MAIN_TAB_VALUE = "main_##Q$SC^#S6";

export interface EntityEditViewProps<M extends Record<string, any>> {
    path: string;
    collection: EntityCollection<M>;
    entityId?: string;
    copy?: boolean;
    selectedSubPath?: string;
    parentCollectionIds: string[];
    onValuesAreModified: (modified: boolean) => void;
    onUpdate?: (params: { entity: Entity<any> }) => void;
    onClose?: () => void;
}

/**
 * This is the default view that is used as the content of a side panel when
 * an entity is opened.
 * You probably don't want to use this view directly since it is bound to the
 * side panel. Instead, you might want to use {@link EntityForm} or {@link EntityCollectionView}
 */
export function EntityEditView<M extends Record<string, any>, UserType extends User>({
                                                                                         entityId,
                                                                                         ...props
                                                                                     }: EntityEditViewProps<M>) {
    const {
        entity,
        dataLoading,
        // eslint-disable-next-line no-unused-vars
        dataLoadingError
    } = useEntityFetch<M, UserType>({
        path: props.path,
        entityId: entityId,
        collection: props.collection,
        useCache: false
    });

    if (dataLoading) {
        return <CircularProgressCenter/>
    }

    if (entityId && !entity) {
        console.error(`Entity with id ${entityId} not found in collection ${props.collection.path}`);
    }

    return <EntityEditViewInner<M> {...props}
                                   entityId={entityId}
                                   entity={entity}
                                   dataLoading={dataLoading}/>;
}

export function EntityEditViewInner<M extends Record<string, any>>({
                                                                       path,
                                                                       entityId: entityIdProp,
                                                                       selectedSubPath: selectedSubPathProp,
                                                                       copy,
                                                                       collection,
                                                                       parentCollectionIds,
                                                                       onValuesAreModified,
                                                                       onUpdate,
                                                                       onClose,
                                                                       entity,
                                                                       dataLoading,
                                                                   }: EntityEditViewProps<M> & {
    entity?: Entity<M>,
    dataLoading: boolean
}) {

    if (collection.customId && collection.formAutoSave) {
        console.warn(`The collection ${collection.path} has customId and formAutoSave enabled. This is not supported and formAutoSave will be ignored`);
    }

    const [saving, setSaving] = useState(false);
    /**
     * These are the values that are being saved. They are debounced.
     * We use this only when autoSave is enabled.
     */
    const [valuesToBeSaved, setValuesToBeSaved] = useState<EntityValues<M> | undefined>(undefined);
    useDebouncedCallback(valuesToBeSaved, () => {
        if (valuesToBeSaved)
            saveEntity({
                entityId: usedEntity?.id,
                collection,
                path,
                values: valuesToBeSaved,
                closeAfterSave: false
            });
    }, false, 2000);

    // const largeLayout = useLargeLayout();
    // const largeLayoutTabSelected = useRef(!largeLayout);
    // const resolvedFormWidth: string = typeof formWidth === "number" ? `${formWidth}px` : formWidth ?? FORM_CONTAINER_WIDTH;

    const inputCollection = collection;

    const authController = useAuthController();
    const dataSource = useDataSource(collection);
    const sideDialogContext = useSideDialogContext();
    const sideEntityController = useSideEntityController();
    const snackbarController = useSnackbarController();
    const customizationController = useCustomizationController();
    const context = useFireCMSContext();

    const closeAfterSaveRef = useRef(false);

    const analyticsController = useAnalyticsController();

    const initialResolvedCollection = useMemo(() => resolveCollection({
        collection: inputCollection,
        path,
        values: entity?.values,
        fields: customizationController.propertyConfigs
    }), [entity?.values, path, customizationController.propertyConfigs]);

    const initialStatus = copy ? "copy" : (entityIdProp ? "existing" : "new");
    const [status, setStatus] = useState<EntityStatus>(initialStatus);
    const mustSetCustomId: boolean = (status === "new" || status === "copy") &&
        (Boolean(initialResolvedCollection.customId) && initialResolvedCollection.customId !== "optional");
    const initialEntityId: string | undefined = useMemo((): string | undefined => {
        if (status === "new" || status === "copy") {
            if (mustSetCustomId) {
                return undefined;
            } else {
                return dataSource.generateEntityId(path);
            }
        } else {
            return entityIdProp;
        }
    }, [entityIdProp, status]);

    const [entityId, setEntityId] = React.useState<string | undefined>(initialEntityId);

    // const doOnValuesChanges = (values?: EntityValues<M>) => {
    //     const initialValues = formex.initialValues;
    //     setInternalValues(values);
    //     if (onValuesChanged)
    //         onValuesChanged(values);
    //     if (autoSave && values && !equal(values, initialValues)) {
    //         save(values);
    //     }
    // };

    const [entityIdError, setEntityIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<Error | undefined>();

    const [customIdLoading, setCustomIdLoading] = React.useState<boolean>(false);

    const defaultSelectedView = selectedSubPathProp ?? resolveDefaultSelectedView(
        collection ? collection.defaultSelectedView : undefined,
        {
            status,
            entityId
        }
    );

    const selectedTabRef = useRef<string>(defaultSelectedView ?? MAIN_TAB_VALUE);
    const baseDataSourceValuesRef = useRef<Partial<EntityValues<M>>>(getDataSourceEntityValues(initialResolvedCollection, status, entity));

    const mainViewVisible = selectedTabRef.current === MAIN_TAB_VALUE;

    // const initialValuesRef = useRef<EntityValues<M>>(entity?.values ?? baseDataSourceValues as EntityValues<M>);
    // const [internalValues, setInternalValues] = useState<EntityValues<M> | undefined>(entity?.values ?? baseDataSourceValuesRef.current as EntityValues<M>);

    // const modifiedValuesRef = useRef<EntityValues<M> | undefined>(undefined);
    // const modifiedValues = modifiedValuesRef.current;

    const subcollections = (collection.subcollections ?? []).filter(c => !c.hideFromNavigation);
    const subcollectionsCount = subcollections?.length ?? 0;
    const customViews = collection.entityViews;
    const customViewsCount = customViews?.length ?? 0;
    const autoSave = collection.formAutoSave && !collection.customId;

    const hasAdditionalViews = customViewsCount > 0 || subcollectionsCount > 0;

    const [usedEntity, setUsedEntity] = useState<Entity<M> | undefined>(entity);
    const [readOnly, setReadOnly] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        if (entity)
            setUsedEntity(entity);
    }, [entity]);

    useEffect(() => {
        if (status === "new") {
            setReadOnly(false);
        } else {
            const editEnabled = usedEntity ? canEditEntity(collection, authController, path, usedEntity ?? null) : false;
            if (usedEntity)
                setReadOnly(!editEnabled);
        }
    }, [authController, usedEntity, status]);

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

    const onSaveSuccess = (updatedEntity: Entity<M>, closeAfterSave: boolean) => {

        setSaving(false);
        if (!autoSave)
            snackbarController.open({
                type: "success",
                message: `${collection.singularName ?? collection.name}: Saved correctly`
            });

        setUsedEntity(updatedEntity);
        setStatus("existing");

        onValuesAreModified(false);

        if (onUpdate)
            onUpdate({ entity: updatedEntity });

        if (closeAfterSave) {
            console.log("Closing side dialog")
            sideDialogContext.setBlocked(false);
            sideDialogContext.close(true);
            onClose?.();
        } else if (status !== "existing") {
            sideEntityController.replace({
                path,
                entityId: updatedEntity.id,
                selectedSubPath: selectedTabRef.current,
                updateUrl: true,
                collection,
            });
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
            if (inputCollection.customId) {
                if (inputCollection.customId !== "optional" && !entityId) {
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

    const formex: FormexController<M> = useCreateFormex<M>({
        initialValues: baseDataSourceValuesRef.current as M,
        onSubmit,
        validation: (values) => {
            return validationSchema?.validate(values, { abortEarly: false })
                .then(() => {
                    return {};
                })
                .catch((e: any) => {
                    const errors: Record<string, string> = {};
                    e.inner.forEach((error: any) => {
                        errors[error.path] = error.message;
                    });
                    return yupToFormErrors(e);
                });
        }
    });

    const resolvedCollection = resolveCollection<M>({
        collection: inputCollection,
        path,
        entityId,
        values: formex.values,
        previousValues: formex.initialValues,
        fields: customizationController.propertyConfigs
    });

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
        entityId,
        path,
        save,
        formex
    };

    const resolvedEntityViews = customViews ? customViews
            .map(e => resolveEntityView(e, customizationController.entityViews))
            .filter(Boolean) as EntityCustomView[]
        : [];

    const selectedEntityView = resolvedEntityViews.find(e => e.key === selectedTabRef.current);
    const shouldShowEntityActions = !autoSave && (selectedTabRef.current === MAIN_TAB_VALUE || selectedEntityView?.includeActions);

    const customViewsView: React.ReactNode[] | undefined = customViews && resolvedEntityViews
        .map(
            (customView, colIndex) => {
                if (!customView)
                    return null;
                if (selectedTabRef.current !== customView.key)
                    return null;
                const Builder = customView.Builder;
                if (!Builder) {
                    console.error("customView.Builder is not defined");
                    return null;
                }
                return <div
                    className={cls(defaultBorderMixin,
                        "relative flex-grow w-full h-full overflow-auto ")}
                    key={`custom_view_${customView.key}`}
                    role="tabpanel">
                    <ErrorBoundary>
                        {formContext && <Builder
                            collection={collection}
                            entity={usedEntity}
                            modifiedValues={formex.values ?? usedEntity?.values}
                            formContext={formContext}
                        />}
                    </ErrorBoundary>
                </div>;
            }
        ).filter(Boolean);

    const globalLoading = (dataLoading && !usedEntity) ||
        ((!usedEntity || readOnly === undefined) && (status === "existing" || status === "copy"));

    const loading = globalLoading || saving;

    const subCollectionsViews = subcollections && subcollections.map(
        (subcollection, colIndex) => {
            const subcollectionId = subcollection.id ?? subcollection.path;
            const fullPath = usedEntity ? `${path}/${usedEntity?.id}/${removeInitialAndTrailingSlashes(subcollectionId)}` : undefined;
            if (selectedTabRef.current !== subcollectionId)
                return null;
            return (
                <div
                    className={"relative flex-grow h-full overflow-auto w-full"}
                    key={`subcol_${subcollectionId}`}
                    role="tabpanel">

                    {loading && <CircularProgressCenter/>}

                    {!globalLoading &&
                        (usedEntity && fullPath
                            ? <EntityCollectionView
                                fullPath={fullPath}
                                parentCollectionIds={[...parentCollectionIds, collection.id]}
                                isSubCollection={true}
                                {...subcollection}/>
                            : <div
                                className="flex items-center justify-center w-full h-full p-3">
                                <Typography variant={"label"}>
                                    You need to save your entity before
                                    adding additional collections
                                </Typography>
                            </div>)
                    }

                </div>
            );
        }
    ).filter(Boolean);

    const onDiscard = useCallback(() => {
        onValuesAreModified(false);
    }, []);

    const onSideTabClick = (value: string) => {
        selectedTabRef.current = value;
        sideEntityController.replace({
            path,
            entityId,
            selectedSubPath: value === MAIN_TAB_VALUE ? undefined : value,
            updateUrl: true,
            collection,
        });
    };

    const onIdUpdateError = useCallback((error: any) => {
        snackbarController.open({
            type: "error",
            message: "Error updating id, check the console"
        });
    }, []);

    const onIdChange = useCallback((id: string) => {
        setUsedEntity((prevEntity) => prevEntity
            ? {
                ...prevEntity,
                id
            }
            : undefined);
    }, []);

    // useEffect(() => {
    //     baseDataSourceValuesRef.current = getDataSourceEntityValues(initialResolvedCollection, status, entity);
    //     const initialValues = formex.initialValues;
    //     if (!formex.isSubmitting && initialValues && status === "existing") {
    //         setUnderlyingChanges(
    //             Object.entries(resolvedCollection.properties)
    //                 .map(([key, property]) => {
    //                     if (isHidden(property)) {
    //                         return {};
    //                     }
    //                     const initialValue = initialValues[key];
    //                     const latestValue = baseDataSourceValuesRef.current[key];
    //                     if (!equal(initialValue, latestValue)) {
    //                         return { [key]: latestValue };
    //                     }
    //                     return {};
    //                 })
    //                 .reduce((a, b) => ({ ...a, ...b }), {}) as Partial<EntityValues<M>>
    //         );
    //     } else {
    //         setUnderlyingChanges({});
    //     }
    // }, [entity, initialResolvedCollection, status]);

    const pluginActions: React.ReactNode[] = [];

    const plugins = customizationController.plugins;

    if (plugins && inputCollection) {
        const actionProps: PluginFormActionProps = {
            entityId,
            path,
            status,
            collection: inputCollection,
            context,
            currentEntityId: entityId,
            formContext
        };
        pluginActions.push(...plugins.map((plugin, i) => (
            plugin.form?.Actions
                ? <plugin.form.Actions
                    key={`actions_${plugin.key}`} {...actionProps}/>
                : null
        )).filter(Boolean));
    }

    const titlePropertyKey = getEntityTitlePropertyKey(resolvedCollection, customizationController.propertyConfigs);
    const title = formex.values && titlePropertyKey ? getValueInPath(formex.values, titlePropertyKey) : undefined;

    const onIdUpdate = inputCollection.callbacks?.onIdUpdate;

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
                onIdUpdateError && onIdUpdateError(e);
                console.error(e);
            }
            setCustomIdLoading(false);
        }
    }, [entityId, formex.values, status]);

    useEffect(() => {
        doOnIdUpdate();
    }, [doOnIdUpdate]);

    const [underlyingChanges, setUnderlyingChanges] = useState<Partial<EntityValues<M>>>({});

    const uniqueFieldValidator: CustomFieldValidator = useCallback(({
                                                                        name,
                                                                        value,
                                                                        property
                                                                    }) => dataSource.checkUniqueField(path, name, value, entityId),
        [dataSource, path, entityId]);

    const validationSchema = useMemo(() => entityId
            ? getYupEntitySchema(
                entityId,
                resolvedCollection.properties,
                uniqueFieldValidator)
            : undefined,
        [entityId, resolvedCollection.properties, uniqueFieldValidator]);

    const getActionsForEntity = useCallback(({
                                                 entity,
                                                 customEntityActions
                                             }: {
        entity?: Entity<M>,
        customEntityActions?: EntityAction[]
    }): EntityAction[] => {
        const createEnabled = canCreateEntity(inputCollection, authController, path, null);
        const deleteEnabled = entity ? canDeleteEntity(inputCollection, authController, path, entity) : true;
        const actions: EntityAction[] = [];
        if (createEnabled)
            actions.push(copyEntityAction);
        if (deleteEnabled)
            actions.push(deleteEntityAction);
        if (customEntityActions)
            actions.push(...customEntityActions);
        return actions;
    }, [authController, inputCollection, path]);

    const modified = formex.dirty;
    useEffect(() => {
        if (!autoSave) {
            onValuesAreModified(modified);
        } else {
            if (formex.values && !equal(formex.values, lastSavedValues.current)) {
                save(formex.values);
            }
        }
    }, [modified, formex.values]);

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

    const formFields = (
        <>
            {(getFormFieldKeys(resolvedCollection))
                .map((key) => {

                    const property = resolvedCollection.properties[key];
                    if (property) {

                        const underlyingValueHasChanged: boolean =
                            !!underlyingChanges &&
                            Object.keys(underlyingChanges).includes(key) &&
                            !!formex.touched[key];

                        const disabled = (!autoSave && formex.isSubmitting) || isReadOnly(property) || Boolean(property.disabled);
                        const hidden = isHidden(property);
                        if (hidden) return null;
                        const cmsFormFieldProps: PropertyFieldBindingProps<any, M> = {
                            propertyKey: key,
                            disabled,
                            property,
                            includeDescription: property.description || property.longDescription,
                            underlyingValueHasChanged: underlyingValueHasChanged && !autoSave,
                            context: formContext,
                            tableMode: false,
                            partOfArray: false,
                            partOfBlock: false,
                            autoFocus: false
                        };

                        return (
                            <div id={`form_field_${key}`}
                                 key={`field_${resolvedCollection.name}_${key}`}>
                                <ErrorBoundary>
                                    <Tooltip title={<PropertyIdCopyTooltipContent propertyId={key}/>}
                                             delayDuration={800}
                                             side={"left"}
                                             align={"start"}
                                             sideOffset={16}>
                                        <PropertyFieldBinding {...cmsFormFieldProps}/>
                                    </Tooltip>
                                </ErrorBoundary>
                            </div>
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
                            : <>{additionalField.value?.({
                                entity,
                                context
                            })}</>;
                        return (
                            <div>
                                <LabelWithIcon icon={<NotesIcon size={"small"}/>}
                                               title={additionalField.name}
                                               className={"text-text-secondary dark:text-text-secondary-dark ml-3.5"}/>
                                <div
                                    className={cls(paperMixin, "min-h-14 p-4 md:p-6 overflow-x-scroll no-scrollbar")}>

                                    <ErrorBoundary>
                                        {child}
                                    </ErrorBoundary>

                                </div>
                            </div>
                        );
                    }

                    console.warn(`Property ${key} not found in collection ${resolvedCollection.name} in properties or additional fields. Skipping.`);
                    return null;
                })
                .filter(Boolean)}

        </>
    );

    const disabled = formex.isSubmitting || (!modified && status === "existing");
    const formRef = React.useRef<HTMLDivElement>(null);

    const entityActions = getActionsForEntity({
        entity,
        customEntityActions: inputCollection.entityActions
    });
    const formActions = entityActions.filter(a => a.includeInForm === undefined || a.includeInForm);

    const dialogActions = <DialogActions position={"absolute"}>

        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>
                    {savingError.message}
                </Typography>
            </div>}

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
                                fullPath: resolvedCollection.path,
                                collection: resolvedCollection,
                                context,
                                sideEntityController
                            });
                    }}>
                    {action.icon}
                </IconButton>
            ))}
        </div>}
        {formex.isSubmitting && <CircularProgress size={"small"}/>}
        <Button
            variant="text"
            disabled={disabled || formex.isSubmitting}
            type="reset">
            {status === "existing" ? "Discard" : "Clear"}
        </Button>

        <Button
            variant="text"
            color="primary"
            type="submit"
            disabled={disabled || formex.isSubmitting}
            onClick={() => {
                closeAfterSaveRef.current = false;
            }}>
            {status === "existing" && "Save"}
            {status === "copy" && "Create copy"}
            {status === "new" && "Create"}
        </Button>

        <Button
            variant="filled"
            color="primary"
            type="submit"
            disabled={disabled || formex.isSubmitting}
            onClick={() => {
                closeAfterSaveRef.current = true;
            }}>
            {status === "existing" && "Save and close"}
            {status === "copy" && "Create copy and close"}
            {status === "new" && "Create and close"}
        </Button>

    </DialogActions>;

    function buildForm() {

        let form = <div className="h-full overflow-auto">

            {pluginActions.length > 0 && <div
                className={cls("w-full flex justify-end items-center sticky top-0 right-0 left-0 z-10 bg-opacity-60 bg-slate-200 dark:bg-opacity-60 dark:bg-slate-800 backdrop-blur-md")}>
                {pluginActions}
            </div>}

            <div className="pt-12 pb-16 pl-8 pr-8 md:pl-10 md:pr-10">
                <div
                    className={`w-full py-2 flex flex-col items-start mt-${4 + (pluginActions ? 8 : 0)} lg:mt-${8 + (pluginActions ? 8 : 0)} mb-8`}>

                    <Typography
                        className={"mt-4 flex-grow line-clamp-1 " + inputCollection.hideIdFromForm ? "mb-2" : "mb-0"}
                        variant={"h4"}>{title ?? inputCollection.singularName ?? inputCollection.name}
                    </Typography>
                    <Alert color={"base"} className={"w-full"} size={"small"}>
                        <code className={"text-xs select-all"}>{path}/{entityId}</code>
                    </Alert>
                </div>

                {!collection.hideIdFromForm &&
                    <CustomIdField customId={inputCollection.customId}
                                   entityId={entityId}
                                   status={status}
                                   onChange={setEntityId}
                                   error={entityIdError}
                                   loading={customIdLoading}
                                   entity={entity}/>}

                {entityId && formContext && <>
                    <div className="mt-12 flex flex-col gap-8"
                         ref={formRef}>

                        {formFields}

                        <ErrorFocus containerRef={formRef}/>

                    </div>

                    <div className="h-14"/>

                </>}

            </div>
        </div>;

        if (plugins) {
            plugins.forEach((plugin: FireCMSPlugin) => {
                if (plugin.form?.provider) {
                    form = (
                        <plugin.form.provider.Component
                            status={status}
                            path={path}
                            collection={collection}
                            onDiscard={onDiscard}
                            entity={usedEntity}
                            context={context}
                            formContext={formContext}
                            {...plugin.form.provider.props}>
                            {form}
                        </plugin.form.provider.Component>
                    );
                }
            });
        }
        return <ErrorBoundary>{form}</ErrorBoundary>;
    }

    const entityView = (readOnly === undefined)
        ? <></>
        : (!readOnly
            ? buildForm()
            : (
                <>
                    <Typography
                        className={"mt-16 mb-8 mx-8"}
                        variant={"h4"}>{collection.singularName ?? collection.name}
                    </Typography>
                    <EntityView
                        className={"px-12"}
                        entity={usedEntity as Entity<M>}
                        path={path}
                        collection={collection}/>

                </>
            ));

    const subcollectionTabs = subcollections && subcollections.map(
        (subcollection) =>
            <Tab
                className="text-sm min-w-[140px]"
                value={subcollection.id}
                key={`entity_detail_collection_tab_${subcollection.name}`}>
                {subcollection.name}
            </Tab>
    );

    const customViewTabs = resolvedEntityViews.map(
        (view) =>

            <Tab
                className="text-sm min-w-[140px]"
                value={view.key}
                key={`entity_detail_collection_tab_${view.name}`}>
                {view.name}
            </Tab>
    );

    useEffect(() => {
        if (entityId && onIdChange)
            onIdChange(entityId);
    }, [entityId, onIdChange]);

    return (
        <Formex value={formex}>

            <div className="flex flex-col h-full w-full transition-width duration-250 ease-in-out">

                <div
                    className={cls(defaultBorderMixin, "no-scrollbar border-b pl-2 pr-2 pt-1 flex items-end overflow-scroll bg-gray-50 dark:bg-gray-950")}>

                    <div
                        className="pb-1 self-center">
                        <IconButton
                            onClick={() => {
                                onClose?.();
                                return sideDialogContext.close(false);
                            }}>
                            <CloseIcon size={"small"}/>
                        </IconButton>
                    </div>

                    <div className={"flex-grow"}/>

                    {globalLoading && <div
                        className="self-center">
                        <CircularProgress size={"small"}/>
                    </div>}

                    <Tabs
                        value={selectedTabRef.current}
                        onValueChange={(value) => {
                            onSideTabClick(value);
                        }}
                        className="pl-4 pr-4 pt-0">

                        <Tab
                            disabled={!hasAdditionalViews}
                            value={MAIN_TAB_VALUE}
                            className={`${
                                !hasAdditionalViews ? "hidden" : ""
                            } text-sm min-w-[140px]`}
                        >{collection.singularName ?? collection.name}</Tab>

                        {customViewTabs}

                        {subcollectionTabs}
                    </Tabs>

                </div>

                <form
                    onSubmit={formex.handleSubmit}
                    onReset={() => {
                        formex.resetForm();
                        return onDiscard && onDiscard();
                    }}
                    noValidate
                    className={"flex-grow h-full flex overflow-auto flex-col w-full"}>

                    <div
                        role="tabpanel"
                        hidden={!mainViewVisible}
                        id={`form_${path}`}
                        className={" w-full"}>

                        {globalLoading
                            ? <CircularProgressCenter/>
                            : entityView}

                    </div>

                    {customViewsView}

                    {subCollectionsViews}

                    {shouldShowEntityActions && dialogActions}

                </form>

            </div>
        </Formex>
    );
}

function getDataSourceEntityValues<M extends object>(initialResolvedCollection: ResolvedEntityCollection,
                                                     status: "new" | "existing" | "copy",
                                                     entity: Entity<M> | undefined): Partial<EntityValues<M>> {

    const properties = initialResolvedCollection.properties;
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

export type EntityFormSaveParams<M extends Record<string, any>> = {
    collection: ResolvedEntityCollection<M>,
    path: string,
    entityId: string | undefined,
    values: EntityValues<M>,
    previousValues?: EntityValues<M>,
    closeAfterSave: boolean,
    autoSave: boolean
};

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
