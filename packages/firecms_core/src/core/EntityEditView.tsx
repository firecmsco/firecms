import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
    CMSAnalyticsEvent,
    Entity,
    EntityAction,
    EntityCollection,
    EntityCustomView,
    EntityStatus,
    EntityValues,
    FireCMSContext,
    FireCMSPlugin,
    FormContext,
    PluginFormActionProps,
    PropertyFieldBindingProps,
    ResolvedEntityCollection,
    SideEntityController,
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
    getFormFieldKeys
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
    mergeEntityActions,
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
    useLargeLayout,
    useSideEntityController,
    useSnackbarController
} from "../hooks";
import {
    Alert,
    Button,
    CheckIcon,
    Chip,
    CircularProgress,
    cls,
    defaultBorderMixin,
    DialogActions,
    EditIcon,
    IconButton,
    LoadingButton,
    NotesIcon,
    paperMixin,
    Tab,
    Tabs,
    Tooltip,
    Typography
} from "@firecms/ui";
import { Formex, FormexController, getIn, setIn, useCreateFormex } from "@firecms/formex";
import { useAnalyticsController } from "../hooks/useAnalyticsController";
import { CustomIdField } from "../form/components/CustomIdField";
import { CustomFieldValidator, getYupEntitySchema } from "../form/validation";
import { ErrorFocus } from "../form/components/ErrorFocus";
import { LabelWithIconAndTooltip, PropertyFieldBinding } from "../form";
import { ValidationError } from "yup";
import { getEntityFromCache, removeEntityFromCache, saveEntityToCache } from "../util/entity_cache";

const MAIN_TAB_VALUE = "main_##Q$SC^#S6";

export type OnUpdateParams = {
    entity: Entity<any>,
    status: EntityStatus,
    path: string
    entityId?: string;
    selectedTab?: string;
    collection: EntityCollection<any>
};

export type OnTabChangeParams<M extends Record<string, any>> = {
    path: string;
    entityId?: string;
    selectedTab?: string;
    collection: EntityCollection<M>;
};

export interface EntityEditViewProps<M extends Record<string, any>> {
    path: string;
    collection: EntityCollection<M>;
    entityId?: string;
    databaseId?: string;
    copy?: boolean;
    selectedTab?: string;
    parentCollectionIds: string[];
    onValuesModified?: (modified: boolean) => void;
    onSaved?: (params: OnUpdateParams) => void;
    onClose?: () => void;
    onTabChange?: (props: OnTabChangeParams<M>) => void;
    layout?: "side_panel" | "full_screen";
    barActions?: React.ReactNode;
}

/**
 * This is the default view that is used as the content of a side panel when
 * an entity is opened.
 * You probably don't want to use this view directly since it is bound to the
 * side panel.
 */
export function EntityEditView<M extends Record<string, any>, USER extends User>({
                                                                                     entityId,
                                                                                     ...props
                                                                                 }: EntityEditViewProps<M>) {
    const {
        entity,
        dataLoading,
        // eslint-disable-next-line no-unused-vars
        dataLoadingError
    } = useEntityFetch<M, USER>({
        path: props.path,
        entityId: entityId,
        collection: props.collection,
        databaseId: props.databaseId,
        useCache: false
    });

    const cachedValues = entityId ? getEntityFromCache(props.path + "/" + entityId) : getEntityFromCache(props.path + "#new");

    if (dataLoading && !cachedValues) {
        return <CircularProgressCenter/>
    }

    if (entityId && !entity && !cachedValues) {
        console.error(`Entity with id ${entityId} not found in collection ${props.path}`);
    }

    return <EntityEditViewInner<M> {...props}
                                   entityId={entityId}
                                   entity={entity}
                                   cachedDirtyValues={cachedValues as Partial<M>}
                                   dataLoading={dataLoading}
    />;
}

export function EntityEditViewInner<M extends Record<string, any>>({
                                                                       path,
                                                                       entityId: entityIdProp,
                                                                       selectedTab: selectedTabProp,
                                                                       copy,
                                                                       collection,
                                                                       parentCollectionIds,
                                                                       onValuesModified,
                                                                       onSaved,
                                                                       onClose,
                                                                       onTabChange,
                                                                       entity,
                                                                       cachedDirtyValues,
                                                                       dataLoading,
                                                                       layout = "side_panel",
                                                                       barActions
                                                                   }: EntityEditViewProps<M> & {
    entity?: Entity<M>,
    cachedDirtyValues?: Partial<M>, // dirty cached entity in memory
    dataLoading: boolean,
}) {

    const largeLayout = useLargeLayout();
    if (collection.customId && collection.formAutoSave) {
        console.warn(`The collection ${collection.path} has customId and formAutoSave enabled. This is not supported and formAutoSave will be ignored`);
    }

    const actionsAtTheBottom = !largeLayout || layout === "side_panel";

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

    const inputCollection = collection;

    const authController = useAuthController();
    const dataSource = useDataSource(collection);
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
        propertyConfigs: customizationController.propertyConfigs
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
                return dataSource.generateEntityId(path, collection);
            }
        } else {
            return entityIdProp;
        }
    }, [entityIdProp, status]);

    const [entityId, setEntityId] = React.useState<string | undefined>(initialEntityId);

    const [entityIdError, setEntityIdError] = React.useState<boolean>(false);
    const [savingError, setSavingError] = React.useState<Error | undefined>();

    const [customIdLoading, setCustomIdLoading] = React.useState<boolean>(false);

    const defaultSelectedView = useMemo(() => resolveDefaultSelectedView(
        collection ? collection.defaultSelectedView : undefined,
        {
            status,
            entityId
        }
    ), []);

    const [selectedTab, setSelectedTab] = useState<string>(selectedTabProp ?? defaultSelectedView ?? MAIN_TAB_VALUE);

    useEffect(() => {
        if ((selectedTabProp ?? MAIN_TAB_VALUE) !== selectedTab) {
            setSelectedTab(selectedTabProp ?? MAIN_TAB_VALUE);
        }
    }, [selectedTabProp]);

    const mainViewVisible = selectedTab === MAIN_TAB_VALUE;

    const subcollections = (collection.subcollections ?? []).filter(c => !c.hideFromNavigation);
    const subcollectionsCount = subcollections?.length ?? 0;
    const customViews = collection.entityViews;
    const customViewsCount = customViews?.length ?? 0;
    const autoSave = collection.formAutoSave && !collection.customId;

    const hasAdditionalViews = customViewsCount > 0 || subcollectionsCount > 0;

    const [usedEntity, setUsedEntity] = useState<Entity<M> | undefined>(entity);
    const [readOnly, setReadOnly] = useState<boolean | undefined>(undefined);

    const baseDataSourceValuesRef = useRef<Partial<EntityValues<M>> | null>(cachedDirtyValues ?? getDataSourceEntityValues(initialResolvedCollection, status, usedEntity));

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

        setUsedEntity(updatedEntity);
        setStatus("existing");
        setEntityId(updatedEntity.id);

        if (onSaved) {
            onSaved({
                entity: updatedEntity,
                status,
                path,
                entityId: updatedEntity.id,
                selectedTab: MAIN_TAB_VALUE === selectedTab ? undefined : selectedTab,
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
        initialDirty: Boolean(cachedDirtyValues),
        onSubmit,
        validation: (values) => {
            return validationSchema?.validate(values, { abortEarly: false })
                .then(() => {
                    return {};
                })
                .catch((e: any) => {
                    // const errors: Record<string, string> = {};
                    // e.inner.forEach((error: any) => {
                    //     errors[error.path] = error.message;
                    // });
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
        propertyConfigs: customizationController.propertyConfigs
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
        entityId: entityId as string,
        path,
        save,
        formex
    };

    const resolvedEntityViews = customViews ? customViews
            .map(e => resolveEntityView(e, customizationController.entityViews))
            .filter(Boolean) as EntityCustomView[]
        : [];

    const selectedEntityView = resolvedEntityViews.find(e => e.key === selectedTab);
    const shouldShowEntityActions = !autoSave && (selectedTab === MAIN_TAB_VALUE || selectedEntityView?.includeActions);

    const customViewsView: React.ReactNode[] | undefined = customViews && resolvedEntityViews
        .map(
            (customView, colIndex) => {
                if (!customView)
                    return null;
                const Builder = customView.Builder;
                if (!Builder) {
                    console.error("customView.Builder is not defined");
                    return null;
                }
                return <div
                    className={cls(defaultBorderMixin,
                        "relative flex-grow w-full h-full overflow-auto",
                        {
                            "hidden": selectedTab !== customView.key
                        })}
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

    const subCollectionsViews = subcollections && subcollections.map(
        (subcollection, colIndex) => {
            const subcollectionId = subcollection.id ?? subcollection.path;
            const fullPath = usedEntity ? `${path}/${usedEntity?.id}/${removeInitialAndTrailingSlashes(subcollectionId)}` : undefined;
            return (
                <div
                    className={cls("relative flex-grow h-full overflow-auto w-full",
                        {
                            "hidden": selectedTab !== subcollectionId
                        })}
                    key={`subcol_${subcollectionId}`}
                    role="tabpanel">

                    {globalLoading || saving && <CircularProgressCenter/>}

                    {!globalLoading &&
                        (usedEntity && fullPath
                            ? <EntityCollectionView
                                fullPath={fullPath}
                                parentCollectionIds={[...parentCollectionIds, collection.id]}
                                isSubCollection={true}
                                updateUrl={false}
                                {...subcollection}
                                openEntityMode={layout}/>
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
        onValuesModified?.(false);
    }, []);

    const onSideTabClick = (value: string) => {
        setSelectedTab(value);
        if (status === "existing") {
            onTabChange?.({
                path,
                entityId,
                selectedTab: value === MAIN_TAB_VALUE ? undefined : value,
                collection
            });
        }
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
            formContext,
            layout
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
                onIdUpdateError?.(e);
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
                                                                    }) => dataSource.checkUniqueField(path, name, value, entityId, collection),
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
            return mergeEntityActions(actions, customEntityActions);
        return actions;
    }, [authController, inputCollection, path]);

    const deferredValues = useDeferredValue(formex.values);
    const modified = formex.dirty;

    useEffect(() => {
        const key = (status === "new" || status === "copy") ? path + "#new" : path + "/" + entityId;
        if (modified) {
            saveEntityToCache(key, deferredValues);
        }
    }, [deferredValues, modified]);

    useEffect(() => {
        if (!autoSave) {
            onValuesModified?.(modified);
        }
    }, [modified]);

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

    const formFields = (
        <>
            {(getFormFieldKeys(resolvedCollection))
                .map((key) => {

                    const property = resolvedCollection.properties[key];
                    if (property) {

                        const underlyingValueHasChanged: boolean =
                            !!underlyingChanges &&
                            Object.keys(underlyingChanges).includes(key) &&
                            formex.touched[key];

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
                            partOfArray: false,
                            minimalistView: false,
                            autoFocus: false
                        };

                        return (
                            <div id={`form_field_${key}`}
                                 key={`field_${resolvedCollection.name}_${key}`}>
                                <ErrorBoundary>
                                    <PropertyFieldBinding {...cmsFormFieldProps}/>
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
                            : <>
                                {additionalField.value?.({
                                    entity,
                                    context
                                })?.toString()}
                            </>;
                        return (
                            <div key={`additional_${key}`}>
                                <LabelWithIconAndTooltip
                                    propertyKey={key}
                                    icon={<NotesIcon size={"small"}/>}
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

        </>);

    const disabled = formex.isSubmitting || (!modified && status === "existing");
    const formRef = React.useRef<HTMLDivElement>(null);

    const entityActions = getActionsForEntity({
        entity,
        customEntityActions: inputCollection.entityActions
    });
    const formActions = entityActions.filter(a => a.includeInForm === undefined || a.includeInForm);

    const dialogActions = actionsAtTheBottom
        ? buildBottomActions({
            savingError: savingError,
            entity: entity,
            formActions: formActions,
            resolvedCollection: resolvedCollection,
            context: context,
            sideEntityController: sideEntityController,
            isSubmitting: formex.isSubmitting,
            disabled: disabled,
            status: status,
            setPendingClose: (value: boolean) => {
                closeAfterSaveRef.current = value;
            },
            pluginActions,
            layout
        })
        : buildSideActions({
            savingError: savingError,
            entity: entity,
            formActions: formActions,
            resolvedCollection: resolvedCollection,
            context: context,
            sideEntityController: sideEntityController,
            isSubmitting: formex.isSubmitting,
            disabled: disabled,
            status: status,
            pluginActions,
            layout
        });

    const entityView = (readOnly === undefined)
        ? <></>
        : (!readOnly
            ? (
                <ErrorBoundary>
                    <div className="flex flex-col w-full pt-12 pb-16 px-4 sm:px-8 md:px-10">

                        {formex.dirty
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

                        <div
                            className={"w-full py-2 flex flex-col items-start mt-4 lg:mt-8 mb-8"}>

                            <Typography
                                className={"mt-4 flex-grow line-clamp-1 " + inputCollection.hideIdFromForm ? "mb-2" : "mb-0"}
                                variant={"h4"}>{title ?? inputCollection.singularName ?? inputCollection.name}
                            </Typography>
                            <Alert color={"base"} className={"w-full"} size={"small"}>
                                <code
                                    className={"text-xs select-all text-text-secondary dark:text-text-secondary-dark"}>{path}/{entityId}</code>
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

                            {actionsAtTheBottom && <div className="h-16"/>}

                        </>}

                    </div>
                </ErrorBoundary>
            )
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
                className="text-sm min-w-[120px]"
                value={subcollection.id}
                key={`entity_detail_collection_tab_${subcollection.name}`}>
                {subcollection.name}
            </Tab>
    );

    const customViewTabs = resolvedEntityViews.map(
        (view) =>

            <Tab
                className="text-sm min-w-[120px]"
                value={view.key}
                key={`entity_detail_collection_tab_${view.name}`}>
                {view.name}
            </Tab>
    );

    useEffect(() => {
        if (entityId && onIdChange)
            onIdChange(entityId);
    }, [entityId, onIdChange]);

    const shouldShowTopBar = Boolean(barActions) || hasAdditionalViews;

    let result = <div className="relative flex flex-col h-full w-full bg-white dark:bg-surface-900">

        {shouldShowTopBar && <div
            className={cls("h-14 flex overflow-visible overflow-x-scroll w-full no-scrollbar h-14 border-b pl-2 pr-2 pt-1 flex items-end bg-surface-50 dark:bg-surface-900", defaultBorderMixin)}>

            {barActions}

            <div className={"flex-grow"}/>

            {globalLoading && <div
                className="self-center">
                <CircularProgress size={"small"}/>
            </div>}

            {hasAdditionalViews && <Tabs
                value={selectedTab}
                onValueChange={(value) => {
                    onSideTabClick(value);
                }}>

                <Tab
                    disabled={!hasAdditionalViews}
                    value={MAIN_TAB_VALUE}
                    className={"text-sm min-w-[120px]"}
                >{collection.singularName ?? collection.name}</Tab>

                {customViewTabs}

                {subcollectionTabs}
            </Tabs>}

        </div>}

        <form
            onSubmit={formex.handleSubmit}
            onReset={() => {

                clearDirtyCache();

                formex.resetForm({
                    values: getDataSourceEntityValues(initialResolvedCollection, status, entity) as M,
                });

                return onDiscard();
            }}
            noValidate
            className={"flex-1 flex flex-row w-full overflow-y-auto justify-center"}>

            <div
                role="tabpanel"
                hidden={!mainViewVisible}
                id={`form_${path}`}
                className={cls("relative flex flex-row max-w-4xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-5xl w-full h-fit", {
                    "hidden": !mainViewVisible
                })}>

                {globalLoading
                    ? <div className="w-full pt-12 pb-16 px-4 sm:px-8 md:px-10"><CircularProgressCenter/></div>
                    : entityView}

            </div>

            {mainViewVisible && shouldShowEntityActions && !actionsAtTheBottom && dialogActions}

            {customViewsView}

            {subCollectionsViews}

            {shouldShowEntityActions && actionsAtTheBottom && dialogActions}

        </form>

    </div>;

    if (plugins) {
        plugins.forEach((plugin: FireCMSPlugin) => {
            if (plugin.form?.provider) {
                result = (
                    <plugin.form.provider.Component
                        status={status}
                        path={path}
                        collection={collection}
                        onDiscard={onDiscard}
                        entity={usedEntity}
                        context={context}
                        formContext={formContext}
                        {...plugin.form.provider.props}>
                        {result}
                    </plugin.form.provider.Component>
                );
            }
        });
    }

    return (
        <Formex value={formex}>

            {result}
        </Formex>
    );
}

function getDataSourceEntityValues<M extends object>(collection: ResolvedEntityCollection,
                                                     status: "new" | "existing" | "copy",
                                                     entity: Entity<M> | undefined): Partial<EntityValues<M>> {

    const properties = collection.properties;
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

type ActionsViewProps<M extends object> = {
    savingError: Error | undefined,
    entity: Entity<M> | undefined,
    formActions: EntityAction[],
    resolvedCollection: ResolvedEntityCollection,
    context: FireCMSContext,
    sideEntityController: SideEntityController,
    isSubmitting: boolean,
    disabled: boolean,
    status: "new" | "existing" | "copy",
    setPendingClose?: (value: boolean) => void,
    pluginActions?: React.ReactNode[],
    layout: "side_panel" | "full_screen";
};

function buildBottomActions<M extends object>({
                                                  savingError,
                                                  entity,
                                                  formActions,
                                                  resolvedCollection,
                                                  context,
                                                  sideEntityController,
                                                  isSubmitting,
                                                  disabled,
                                                  status,
                                                  setPendingClose,
                                                  pluginActions,
                                                  layout
                                              }: ActionsViewProps<M>) {

    return <DialogActions position={"absolute"}>

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
                                sideEntityController,
                                openEntityMode: layout
                            });
                    }}>
                    {action.icon}
                </IconButton>
            ))}
        </div>}

        {pluginActions}

        <Button
            variant="text"
            disabled={disabled || isSubmitting}
            type="reset">
            {status === "existing" ? "Discard" : "Clear"}
        </Button>

        <Button
            variant="text"
            color="primary"
            type="submit"
            disabled={disabled || isSubmitting}
            onClick={() => {
                setPendingClose?.(false);
            }}>
            {status === "existing" && "Save"}
            {status === "copy" && "Create copy"}
            {status === "new" && "Create"}
        </Button>

        <LoadingButton
            variant="filled"
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
        </LoadingButton>

    </DialogActions>;
}

function buildSideActions<M extends object>({
                                                savingError,
                                                entity,
                                                formActions,
                                                resolvedCollection,
                                                context,
                                                sideEntityController,
                                                isSubmitting,
                                                disabled,
                                                status,
                                                setPendingClose,
                                                pluginActions
                                            }: ActionsViewProps<M>) {

    return <div
        className={cls("overflow-auto h-full flex flex-col gap-2 w-96 px-4 py-16 sticky top-0 border-l", defaultBorderMixin)}>

        <LoadingButton
            fullWidth={true}
            variant="filled"
            color="primary"
            type="submit"
            size={"large"}
            disabled={disabled || isSubmitting}
            onClick={() => {
                setPendingClose?.(false);
            }}>
            {status === "existing" && "Save"}
            {status === "copy" && "Create copy"}
            {status === "new" && "Create"}
        </LoadingButton>

        <Button
            fullWidth={true}
            variant="text"
            disabled={disabled || isSubmitting}
            type="reset">
            {status === "existing" ? "Discard" : "Clear"}
        </Button>

        {pluginActions}

        {savingError &&
            <div className="text-right">
                <Typography color={"error"}>
                    {savingError.message}
                </Typography>
            </div>}

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

