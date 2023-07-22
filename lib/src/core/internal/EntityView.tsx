import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Entity, EntityCollection, EntityStatus, EntityValues, FireCMSPlugin, FormContext, User } from "../../types";
import {
    CircularProgress,
    CircularProgressCenter,
    EntityCollectionView,
    EntityPreview,
    ErrorBoundary,
    Tab,
    Tabs
} from "../components";
import {
    canEditEntity,
    fullPathToCollectionSegments,
    removeInitialAndTrailingSlashes,
    resolveDefaultSelectedView,
    useDebounce
} from "../util";

import {
    saveEntityWithCallbacks,
    useAuthController,
    useDataSource,
    useEntityFetch,
    useFireCMSContext,
    useSideEntityController,
    useSnackbarController
} from "../../hooks";
import { EntityForm } from "../../form";
import { useSideDialogContext } from "../SideDialogs";
import { Typography } from "../../components/Typography";
import { EntityFormSaveParams } from "../../form/EntityForm";
import { FORM_CONTAINER_WIDTH } from "./common";
import { IconButton } from "../../components";
import { defaultBorderMixin } from "../../styles";
import { CloseIcon } from "../../icons/CloseIcon";

const MAIN_TAB_VALUE = "main_##Q$SC^#S6";

export interface EntityViewProps<M extends Record<string, any>> {
    path: string;
    collection: EntityCollection<M>;
    entityId?: string;
    copy?: boolean;
    selectedSubPath?: string;
    formWidth?: number | string;
    onValuesAreModified: (modified: boolean) => void;
    onUpdate?: (params: { entity: Entity<any> }) => void;
    onClose?: () => void;
}

type EntityViewView = {
    label: string;
    component: React.ReactNode;
    size: "full" | "half";
}

/**
 * This is the default view that is used as the content of a side panel when
 * an entity is opened.
 * You probably don't want to use this view directly since it is bound to the
 * side panel. Instead, you might want to use {@link EntityForm} or {@link EntityCollectionView}
 */
export function EntityView<M extends Record<string, any>, UserType extends User>({
                                                                                     path,
                                                                                     entityId,
                                                                                     selectedSubPath,
                                                                                     copy,
                                                                                     collection,
                                                                                     onValuesAreModified,
                                                                                     formWidth,
                                                                                     onUpdate,
                                                                                     onClose
                                                                                 }: EntityViewProps<M>) {

    if (collection.customId && collection.formAutoSave) {
        console.warn(`The collection ${collection.path} has customId and formAutoSave enabled. This is not supported and formAutoSave will be ignored`);
    }

    const [saving, setSaving] = useState(false);
    /**
     * These are the values that are being saved. They are debounced.
     * We use this only when autoSave is enabled.
     */
    const [valuesToBeSaved, setValuesToBeSaved] = useState<EntityValues<M> | undefined>(undefined);
    useDebounce(valuesToBeSaved, () => {
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

    const resolvedFormWidth: string = typeof formWidth === "number" ? `${formWidth}px` : formWidth ?? FORM_CONTAINER_WIDTH;

    const dataSource = useDataSource();
    const sideDialogContext = useSideDialogContext();
    const sideEntityController = useSideEntityController();
    const snackbarController = useSnackbarController();
    const context = useFireCMSContext();
    const authController = useAuthController<UserType>();

    const [formContext, setFormContext] = useState<FormContext<M> | undefined>(undefined);

    const [status, setStatus] = useState<EntityStatus>(copy ? "copy" : (entityId ? "existing" : "new"));

    const modifiedValuesRef = useRef<EntityValues<M> | undefined>(undefined);
    const modifiedValues = modifiedValuesRef.current;

    const subcollections = (collection.subcollections ?? []).filter(c => !c.hideFromNavigation);
    const subcollectionsCount = subcollections?.length ?? 0;
    const customViews = collection.views;
    const customViewsCount = customViews?.length ?? 0;
    const autoSave = collection.formAutoSave && !collection.customId;

    const hasAdditionalViews = customViewsCount > 0 || subcollectionsCount > 0;

    const defaultSelectedView = selectedSubPath ?? resolveDefaultSelectedView(
        collection ? collection.defaultSelectedView : undefined,
        {
            status,
            entityId
        }
    );

    const selectedTabRef = useRef<string>(defaultSelectedView ?? MAIN_TAB_VALUE);

    const mainViewVisible = selectedTabRef.current === MAIN_TAB_VALUE;

    const {
        entity,
        dataLoading,
        // eslint-disable-next-line no-unused-vars
        dataLoadingError
    } = useEntityFetch<M, UserType>({
        path,
        entityId,
        collection,
        useCache: false
    });

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
            const editEnabled = usedEntity ? canEditEntity(collection, authController, fullPathToCollectionSegments(path), usedEntity ?? null) : false;
            if (usedEntity)
                setReadOnly(!editEnabled);
        }
    }, [authController, usedEntity, status]);

    // useEffect(() => {
    //     if (largeLayoutTabSelected.current === largeLayout)
    //         return;
    //     // open first tab by default in large layouts
    //     if (selectedSubPath !== defaultSelectedView) {
    //         console.log("Replacing url 1", defaultSelectedView);
    //         sideEntityController.replace({
    //             path,
    //             entityId,
    //             selectedSubPath: defaultSelectedView,
    //             updateUrl: true,
    //             collection
    //         });
    //     }
    //     largeLayoutTabSelected.current = largeLayout;
    // }, [defaultSelectedView, largeLayout, selectedSubPath]);

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

    const getSelectedSubPath = (value: number) => {
        if (value === -1) return undefined;

        if (customViews && value < customViewsCount) {
            return customViews[value].path;
        }

        if (subcollections) {
            return subcollections[value - customViewsCount].path;
        }

        throw Error("Something is wrong in getSelectedSubPath");
    };

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
            sideDialogContext.setBlocked(false);
            sideDialogContext.close(true);
            onClose?.();
        } else if (status !== "existing") {
            sideEntityController.replace({
                path,
                entityId: updatedEntity.id,
                selectedSubPath: selectedTabRef.current,
                updateUrl: true,
                collection
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
        saveEntityWithCallbacks({
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
            saveEntity({
                collection,
                path,
                entityId,
                values,
                previousValues,
                closeAfterSave
            });
        }
    };

    const customViewsView: React.ReactNode[] | undefined = customViews && customViews.map(
        (customView, colIndex) => {
            if (selectedTabRef.current !== customView.path)
                return null;
            if (customView.builder) {
                console.warn("customView.builder is deprecated, use customView.Builder instead", customView);
            }
            const Builder = customView.Builder ?? customView.builder;
            if (!Builder) {
                console.error("customView.Builder is not defined");
                return null;
            }
            return <div
                className={clsx(defaultBorderMixin,
                    "relative flex-grow w-full h-full overflow-auto ")}
                key={`custom_view_${customView.path}`}
                role="tabpanel">
                <ErrorBoundary>
                    {formContext && <Builder
                        collection={collection}
                        entity={usedEntity}
                        modifiedValues={modifiedValues ?? usedEntity?.values}
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
            const subcollectionId = subcollection.alias ?? subcollection.path;
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
            collection
        });
    };

    const onValuesChanged = useCallback((values?: EntityValues<M>) => {
        modifiedValuesRef.current = values;
    }, []);

    // eslint-disable-next-line n/handle-callback-err
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

    const onModified = (dirty: boolean) => {
        if (!autoSave)
            onValuesAreModified(dirty);
    }

    function buildForm() {
        const plugins = context.plugins;
        let form = <EntityForm
            status={status}
            path={path}
            collection={collection}
            onEntitySaveRequested={onSaveEntityRequest}
            onDiscard={onDiscard}
            onValuesChanged={onValuesChanged}
            onModified={onModified}
            entity={usedEntity}
            onIdChange={onIdChange}
            onFormContextChange={setFormContext}
            hideId={collection.hideIdFromForm}
            autoSave={autoSave}
            onIdUpdateError={onIdUpdateError}
        />;
        if (plugins) {
            plugins.forEach((plugin: FireCMSPlugin) => {
                if (plugin.form?.provider) {
                    form = (
                        <plugin.form.provider.Component
                            status={status}
                            path={path}
                            collection={collection}
                            onDiscard={onDiscard}
                            onValuesChanged={onValuesChanged}
                            onModified={onModified}
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

    const form = (readOnly === undefined)
        ? <></>
        : (!readOnly
            ? buildForm()
            : (
                <>
                    <Typography
                        className={"mt-16 mb-8 mx-8"}
                        variant={"h4"}>{collection.singularName ?? collection.name}
                    </Typography>
                    <EntityPreview
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
                value={subcollection.path}
                key={`entity_detail_collection_tab_${subcollection.name}`}>
                {subcollection.name}
            </Tab>
    );

    const customViewTabs = customViews && customViews.map(
        (view) =>

            <Tab
                className="text-sm min-w-[140px]"
                value={view.path}
                key={`entity_detail_collection_tab_${view.name}`}>
                {view.name}
            </Tab>
    );

    return (
        <div
            className="flex flex-col h-full w-full transition-width duration-250 ease-in-out">
            {
                <>

                    <div
                        className={clsx(defaultBorderMixin, "border-b pl-2 pr-2 pt-1 flex items-end")}>

                        <div
                            className="pb-1 self-center">
                            <IconButton onClick={() => {
                                onClose?.();
                                return sideDialogContext.close(false);
                            }}
                                        size="large">
                                <CloseIcon/>
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
                                console.log("onValueChange", value);
                                onSideTabClick(value);
                            }}
                            className="pl-4 pr-4 pt-0"
                            tabs={<>
                                <Tab
                                    disabled={!hasAdditionalViews}
                                    // onClick={() => {
                                    //     onSideTabClick(-1);
                                    // }}
                                    value={MAIN_TAB_VALUE}
                                    className={`${
                                        !hasAdditionalViews ? "hidden" : ""
                                    } text-sm min-w-[140px]`}
                                >{collection.singularName ?? collection.name}</Tab>
                                {customViewTabs}
                                {subcollectionTabs}
                            </>}>

                        </Tabs>

                    </div>

                    <div
                        className={"flex-grow h-full flex overflow-auto flex-row w-full "}
                        style={{
                            // width: `calc(${ADDITIONAL_TAB_WIDTH} + ${resolvedFormWidth})`,
                            // maxWidth: "100%",
                            // [`@media (max-width: ${resolvedFormWidth})`]: {
                            //     width: resolvedFormWidth
                            // }
                        }}>

                        <div
                            role="tabpanel"
                            hidden={!mainViewVisible}
                            id={`form_${path}`}
                            className={" w-full"}>

                            {globalLoading
                                ? <CircularProgressCenter/>
                                : form}

                        </div>

                        {customViewsView}

                        {subCollectionsViews}

                    </div>

                </>
            }

        </div>
    );
}
