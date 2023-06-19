import React, { useCallback, useEffect, useRef, useState } from "react";
import equal from "react-fast-compare";
import { CircularProgress, Divider, IconButton, Tab, Tabs, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { Entity, EntityCollection, EntityStatus, EntityValues, FireCMSPlugin, FormContext, User } from "../../types";
import { CircularProgressCenter, EntityCollectionView, EntityPreview, ErrorBoundary } from "../components";
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
import { useLargeSideLayout } from "./useLargeSideLayout";
import Text from "../../components/Text";
import { EntityFormSaveParams } from "../../form/EntityForm";
import { ADDITIONAL_TAB_WIDTH, CONTAINER_FULL_WIDTH, FORM_CONTAINER_WIDTH } from "./common";

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

/**
 * This is the default view that is used as the content of a side panel when
 * an entity is opened.
 * You probably don't want to use this view directly since it is bound to the
 * side panel. Instead, you might want to use {@link EntityForm} or {@link EntityCollectionView}
 */
export const EntityView = React.memo<EntityViewProps<any>>(
    function EntityView<M extends Record<string, any>, UserType extends User>({
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
                    values: valuesToBeSaved,
                    closeAfterSave: false
                });
        }, false, 2000);

        const theme = useTheme();
        const largeLayout = useLargeSideLayout();
        const largeLayoutTabSelected = useRef(!largeLayout);

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

        const getTabPositionFromPath = useCallback((subPath: string): number => {
            if (customViews) {
                const index = customViews
                    .map((c) => c.path)
                    .findIndex((p) => p === subPath);
                if (index !== -1)
                    return index;
            }

            if (subcollections) {
                const index = subcollections
                    .map((c) => c.path)
                    .findIndex((p) => p === subPath);
                if (index !== -1)
                    return index + customViewsCount;
            }
            return -1;
        }, [customViews, customViewsCount, subcollections]);

        const hasAdditionalViews = customViewsCount > 0 || subcollectionsCount > 0;

        const defaultSelectedView = selectedSubPath ?? resolveDefaultSelectedView(
            collection ? collection.defaultSelectedView : undefined,
            {
                status,
                entityId
            }
        );

        const [tabsPosition, setTabsPosition] = React.useState(defaultSelectedView ? getTabPositionFromPath(defaultSelectedView) : -1);

        const mainViewVisible = tabsPosition === -1 || largeLayout;

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

        const [currentEntityId, setCurrentEntityId] = React.useState<string | undefined>(entityId);
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

        useEffect(() => {
            if (largeLayoutTabSelected.current === largeLayout)
                return;
            // open first tab by default in large layouts
            if (selectedSubPath !== defaultSelectedView)
                sideEntityController.replace({
                    path,
                    entityId,
                    selectedSubPath: defaultSelectedView,
                    updateUrl: true,
                    collection
                });
            largeLayoutTabSelected.current = largeLayout;
        }, [defaultSelectedView, largeLayout, selectedSubPath]);

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
                sideDialogContext.setBlocked(false);
                sideDialogContext.close(true);
                onClose?.();
            } else if (status !== "existing") {
                sideEntityController.replace({
                    path,
                    entityId: updatedEntity.id,
                    selectedSubPath,
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

        function saveEntity({
                                values,
                                previousValues,
                                closeAfterSave
                            }: {
            values: M,
            previousValues?: M,
            closeAfterSave: boolean,
        }) {
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
        }

        const onSaveEntityRequest = async ({
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
                    values,
                    previousValues,
                    closeAfterSave
                });
            }
        };

        const customViewsView: React.ReactNode[] | undefined = customViews && customViews.map(
            (customView, colIndex) => {
                if (tabsPosition !== colIndex)
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
                    className={`w-[${ADDITIONAL_TAB_WIDTH}] flex-grow h-full overflow-auto border-l border-gray-100 dark:border-gray-800 xl:border-l-0 xl:w-[${CONTAINER_FULL_WIDTH}]`}
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
                const fullPath = usedEntity ? `${path}/${usedEntity?.id}/${removeInitialAndTrailingSlashes(subcollection.alias ?? subcollection.path)}` : undefined;
                if (tabsPosition !== colIndex + customViewsCount)
                    return null;
                return (
                    <div
                        className={`flex-grow h-full overflow-auto border-l border-opacity-50 border-gray-100 dark:border-gray-800 border-l-0 w-[${CONTAINER_FULL_WIDTH}] xl:border-none xl:w-[${ADDITIONAL_TAB_WIDTH}] ${theme.breakpoints.down("lg") ? `` : ``}`}
                        key={`subcol_${subcollection.alias ?? subcollection.path}`}
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
                                    <Text variant={"label"}>
                                        You need to save your entity before
                                        adding additional collections
                                    </Text>
                                </div>)
                        }

                    </div>
                );
            }
        ).filter(Boolean);

        const getSelectedSubPath = useCallback((value: number) => {
            if (value === -1) return undefined;

            if (customViews && value < customViewsCount) {
                return customViews[value].path;
            }

            if (subcollections) {
                return subcollections[value - customViewsCount].path;
            }

            throw Error("Something is wrong in getSelectedSubPath");
        }, [customViewsCount]);

        const onDiscard = useCallback(() => {
            onValuesAreModified(false);
        }, []);

        const onSideTabClick = (value: number) => {
            setTabsPosition(value);
            sideEntityController.replace({
                path,
                entityId,
                selectedSubPath: getSelectedSubPath(value),
                updateUrl: true,
                collection
            });
        };

        const onValuesChanged = useCallback((values?: EntityValues<M>) => {
            modifiedValuesRef.current = values;
        }, []);

        const onIdChange = useCallback((id: string) => {
            setUsedEntity((value) => value
                ? {
                    ...value,
                    id
                }
                : undefined);
            setCurrentEntityId(id);
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
                                currentEntityId={currentEntityId}
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
                    <EntityPreview
                        entity={usedEntity as Entity<M>}
                        path={path}
                        collection={collection}/>
                ));

        const subcollectionTabs = subcollections && subcollections.map(
            (subcollection) =>
                <Tab
                    className="text-sm min-w-[140px]"
                    wrapped={true}
                    key={`entity_detail_collection_tab_${subcollection.name}`}
                    label={subcollection.name}/>
        );

        const customViewTabs = customViews && customViews.map(
            (view) =>
                <Tab
                    className="text-sm min-w-[140px]"
                    wrapped={true}
                    key={`entity_detail_custom_tab_${view.name}`}
                    label={view.name}/>
        );

        const header = (
            <div
                className={`pl-2 pr-2 pt-1 flex items-end ${theme.palette.mode === "light" ? "bg-" + theme.palette.background.default : "bg-" + theme.palette.background.paper}`}>

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
                    <CircularProgress size={16} thickness={8}/>
                </div>}

                <Tabs
                    value={tabsPosition + 1}
                    indicatorColor="secondary"
                    textColor="inherit"
                    onChange={(ev, value) => {
                        onSideTabClick(value - 1);
                    }}
                    className="pl-4 pr-4 pt-0"
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab
                        label={collection.singularName ?? collection.name}
                        disabled={!hasAdditionalViews}
                        onClick={() => {
                            onSideTabClick(-1);
                        }}
                        className={`${
                            !hasAdditionalViews ? "hidden" : ""
                        } text-sm min-w-[140px]`}
                        wrapped={true}
                    />
                    {customViewTabs}
                    {subcollectionTabs}

                </Tabs>
            </div>

        );

        return (
            <div
                className="flex flex-col h-full w-full transition-width duration-250 ease-in-out">
                {
                    <>

                        {header}

                        <Divider/>

                        <div
                            className="flex-grow h-full flex overflow-auto flex-row w-form xl:w-full"
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
                                className={`w-full xl:w-[${resolvedFormWidth}] h-full overflow-auto`}>

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
    },
    equal
)
