import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Divider, IconButton, Tab, Tabs, Typography, useTheme } from "@mui/material";
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

import { ADDITIONAL_TAB_WIDTH, CONTAINER_FULL_WIDTH, FORM_CONTAINER_WIDTH } from "./common";
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
import { EntityFormSaveParams } from "../../form/EntityForm";

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

    const getTabPositionFromPath = (subPath: string): number => {
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
    };

    const hasAdditionalViews = customViewsCount > 0 || subcollectionsCount > 0;

    const defaultSelectedView = selectedSubPath ?? resolveDefaultSelectedView(
        collection ? collection.defaultSelectedView : undefined,
        {
            status,
            entityId
        }
    );

    const tabsPositionRef = useRef<number>(defaultSelectedView ? getTabPositionFromPath(defaultSelectedView) : -1);

    const mainViewVisible = tabsPositionRef.current === -1 || largeLayout;

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

    useEffect(() => {
        if (largeLayoutTabSelected.current === largeLayout)
            return;
        // open first tab by default in large layouts
        if (selectedSubPath !== defaultSelectedView) {
            console.log("Replacing url 1", defaultSelectedView);
            sideEntityController.replace({
                path,
                entityId,
                selectedSubPath: defaultSelectedView,
                updateUrl: true,
                collection
            });
        }
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
            console.log("Replacing url 2", tabsPositionRef.current, getSelectedSubPath(tabsPositionRef.current));
            sideEntityController.replace({
                path,
                entityId: updatedEntity.id,
                selectedSubPath: getSelectedSubPath(tabsPositionRef.current),
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

    const saveEntity = ({ values, previousValues, closeAfterSave, entityId, collection, path }: {
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
            if (tabsPositionRef.current !== colIndex)
                return null;
            if (customView.builder) {
                console.warn("customView.builder is deprecated, use customView.Builder instead", customView);
            }
            const Builder = customView.Builder ?? customView.builder;
            if (!Builder) {
                console.error("customView.Builder is not defined");
                return null;
            }
            return <Box
                sx={{
                    width: ADDITIONAL_TAB_WIDTH,
                    height: "100%",
                    overflow: "auto",
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    [theme.breakpoints.down("lg")]: {
                        borderLeft: "inherit",
                        width: CONTAINER_FULL_WIDTH
                    }
                }}
                key={`custom_view_${customView.path}`}
                role="tabpanel"
                flexGrow={1}>
                <ErrorBoundary>
                    {formContext && <Builder
                        collection={collection}
                        entity={usedEntity}
                        modifiedValues={modifiedValues ?? usedEntity?.values}
                        formContext={formContext}
                    />}
                </ErrorBoundary>
            </Box>;
        }
    ).filter(Boolean);

    const globalLoading = (dataLoading && !usedEntity) ||
        ((!usedEntity || readOnly === undefined) && (status === "existing" || status === "copy"));

    const loading = globalLoading || saving;

    const subCollectionsViews = subcollections && subcollections.map(
        (subcollection, colIndex) => {
            const fullPath = usedEntity ? `${path}/${usedEntity?.id}/${removeInitialAndTrailingSlashes(subcollection.alias ?? subcollection.path)}` : undefined;
            if (tabsPositionRef.current !== colIndex + customViewsCount)
                return null;
            return (
                <Box
                    sx={{
                        width: ADDITIONAL_TAB_WIDTH,
                        height: "100%",
                        overflow: "auto",
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        [theme.breakpoints.down("lg")]: {
                            borderLeft: "inherit",
                            width: CONTAINER_FULL_WIDTH
                        }
                    }}
                    key={`subcol_${subcollection.alias ?? subcollection.path}`}
                    role="tabpanel"
                    flexGrow={1}>

                    {loading && <CircularProgressCenter/>}

                    {!globalLoading &&
                        (usedEntity && fullPath
                            ? <EntityCollectionView
                                fullPath={fullPath}
                                isSubCollection={true}
                                {...subcollection}/>
                            : <Box
                                sx={{
                                    width: "100%",
                                    height: "100%",
                                    p: 3
                                }}
                                display={"flex"}
                                alignItems={"center"}
                                justifyContent={"center"}>
                                <Typography variant={"label"}>
                                    You need to save your entity before
                                    adding additional collections
                                </Typography>
                            </Box>)
                    }

                </Box>
            );
        }
    ).filter(Boolean);

    const onDiscard = useCallback(() => {
        onValuesAreModified(false);
    }, []);

    const onSideTabClick = (value: number) => {
        tabsPositionRef.current = value;
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
                <EntityPreview
                    entity={usedEntity as Entity<M>}
                    path={path}
                    collection={collection}/>
            ));

    const subcollectionTabs = subcollections && subcollections.map(
        (subcollection) =>
            <Tab
                sx={{
                    fontSize: "0.875rem",
                    minWidth: "140px"
                }}
                wrapped={true}
                key={`entity_detail_collection_tab_${subcollection.name}`}
                label={subcollection.name}/>
    );

    const customViewTabs = customViews && customViews.map(
        (view) =>
            <Tab
                sx={{
                    fontSize: "0.875rem",
                    minWidth: "140px"
                }}
                wrapped={true}
                key={`entity_detail_custom_tab_${view.name}`}
                label={view.name}/>
    );

    const header = (
        <Box sx={{
            paddingLeft: 2,
            paddingRight: 2,
            paddingTop: 1,
            display: "flex",
            alignItems: "end",
            backgroundColor: theme.palette.mode === "light" ? theme.palette.background.default : theme.palette.background.paper
        }}>

            <Box
                sx={{
                    pb: 1,
                    alignSelf: "center"
                }}>
                <IconButton onClick={() => {
                    onClose?.();
                    return sideDialogContext.close(false);
                }}
                            size="large">
                    <CloseIcon/>
                </IconButton>
            </Box>

            <Box flexGrow={1}/>

            {globalLoading && <Box
                sx={{
                    alignSelf: "center"
                }}>
                <CircularProgress size={16} thickness={8}/>
            </Box>}

            <Tabs
                value={tabsPositionRef.current + 1}
                indicatorColor="secondary"
                textColor="inherit"
                onChange={(ev, value) => {
                    onSideTabClick(value - 1);
                }}
                sx={{
                    paddingLeft: theme.spacing(1),
                    paddingRight: theme.spacing(1),
                    paddingTop: theme.spacing(0)
                }}
                variant="scrollable"
                scrollButtons="auto"
            >
                <Tab
                    label={collection.singularName ?? collection.name}
                    disabled={!hasAdditionalViews}
                    onClick={() => {
                        onSideTabClick(-1);
                    }}
                    sx={{
                        display: !hasAdditionalViews ? "none" : undefined,
                        fontSize: "0.875rem",
                        minWidth: "140px"
                    }}
                    wrapped={true}
                />
                {customViewTabs}
                {subcollectionTabs}

            </Tabs>
        </Box>

    );

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
                transition: "width 250ms ease-in-out"
            }}>
            {
                <>

                    {header}

                    <Divider/>

                    <Box sx={{
                        flexGrow: 1,
                        height: "100%",
                        width: `calc(${ADDITIONAL_TAB_WIDTH} + ${resolvedFormWidth})`,
                        maxWidth: "100%",
                        [`@media (max-width: ${resolvedFormWidth})`]: {
                            width: resolvedFormWidth
                        },
                        display: "flex",
                        overflow: "auto",
                        flexDirection: "row"
                    }}>

                        <Box sx={{
                            position: "relative",
                            maxWidth: "100%"
                        }}>
                            <Box
                                role="tabpanel"
                                hidden={!mainViewVisible}
                                id={`form_${path}`}
                                sx={{
                                    width: resolvedFormWidth,
                                    maxWidth: "100%",
                                    height: "100%",
                                    overflow: "auto",
                                    [theme.breakpoints.down("sm")]: {
                                        maxWidth: CONTAINER_FULL_WIDTH,
                                        width: CONTAINER_FULL_WIDTH
                                    }
                                }}>

                                {globalLoading
                                    ? <CircularProgressCenter/>
                                    : form}

                            </Box>
                        </Box>

                        {customViewsView}

                        {subCollectionsViews}

                    </Box>

                </>
            }

        </Box>
    );
}
