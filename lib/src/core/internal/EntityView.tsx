import React, {
    lazy,
    Suspense,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";
import {
    Box,
    CircularProgress,
    Divider,
    IconButton,
    Tab,
    Tabs,
    useMediaQuery,
    useTheme
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
    Entity,
    EntityCallbacks,
    EntityCollection,
    EntitySchema,
    EntityStatus,
    EntityValues,
    PermissionsBuilder,
    ResolvedEntitySchema
} from "../../models";
import { CircularProgressCenter } from "../components";
import { removeInitialAndTrailingSlashes } from "../util/navigation_utils";

import { CONTAINER_FULL_WIDTH, CONTAINER_WIDTH, TAB_WIDTH } from "./common";
import { ErrorBoundary } from "./ErrorBoundary";
import {
    saveEntityWithCallbacks,
    useAuthController,
    useDataSource,
    useEntityFetch,
    useFireCMSContext,
    useSideEntityController,
    useSnackbarController
} from "../../hooks";
import { canEdit } from "../util/permissions";
import { useSchemaRegistry } from "../../hooks/useSchemaRegistry";

const EntityCollectionView = lazy(() => import("../components/EntityCollectionView")) as any;
const EntityForm = lazy(() => import("../../form/EntityForm")) as any;
const EntityPreview = lazy(() => import("../components/EntityPreview")) as any;

export interface EntityViewProps<M, UserType> {
    path: string;
    schema: string | EntitySchema<M>
    entityId?: string;
    copy?: boolean;
    selectedSubpath?: string;
    permissions?: PermissionsBuilder<M, UserType>;
    callbacks?: EntityCallbacks<M>;
    subcollections?: EntityCollection[];
    width?: number | string;
    onModifiedValues: (modified: boolean) => void;
}

export function EntityView<M extends { [Key: string]: any }, UserType>({
                                                                           path,
                                                                           entityId,
                                                                           callbacks,
                                                                           selectedSubpath,
                                                                           copy,
                                                                           permissions,
                                                                           schema,
                                                                           subcollections,
                                                                           onModifiedValues,
                                                                           width
                                                                       }: EntityViewProps<M, UserType>) {

    const resolvedWidth: string | undefined = typeof width === "number" ? `${width}px` : width;

    const dataSource = useDataSource();
    const sideEntityController = useSideEntityController();
    const snackbarContext = useSnackbarController();
    const context = useFireCMSContext();
    const schemaRegistry = useSchemaRegistry();
    const authController = useAuthController<UserType>();

    const [status, setStatus] = useState<EntityStatus>(copy ? "copy" : (entityId ? "existing" : "new"));
    const [currentEntityId, setCurrentEntityId] = useState<string | undefined>(entityId);
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [tabsPosition, setTabsPosition] = React.useState(-1);

    const [modifiedValues, setModifiedValues] = useState<EntityValues<M> | undefined>();

    const {
        entity,
        dataLoading,
        // eslint-disable-next-line no-unused-vars
        dataLoadingError
    } = useEntityFetch<M>({
        path,
        entityId: currentEntityId,
        schema,
        useCache: false
    });

    const resolvedSchema: ResolvedEntitySchema<M> = useMemo(() => schemaRegistry.getResolvedSchema<M>({
        schema,
        path,
        entityId,
        values: modifiedValues,
        previousValues: entity?.values
    }), [schema, schema, path, entityId, modifiedValues]);

    const customViews = resolvedSchema.views;
    const customViewsCount = customViews?.length ?? 0;

    useEffect(() => {
        if (entity)
            setReadOnly(!canEdit(permissions, entity, authController, path, context));
    }, [entity, permissions]);

    const theme = useTheme();
    const largeLayout = useMediaQuery(theme.breakpoints.up("lg"));

    useEffect(() => {
        if (!selectedSubpath)
            setTabsPosition(-1);

        if (customViews) {
            const index = customViews
                .map((c) => c.path)
                .findIndex((p) => p === selectedSubpath);
            setTabsPosition(index);
        }

        if (subcollections && selectedSubpath) {
            const index = subcollections
                .map((c) => c.path)
                .findIndex((p) => p === selectedSubpath);
            setTabsPosition(index + customViewsCount);
        }
    }, [selectedSubpath]);

    const onPreSaveHookError = useCallback((e: Error) => {
        snackbarContext.open({
            type: "error",
            title: "Error before saving",
            message: e?.message
        });
        console.error(e);
    }, []);

    const onSaveSuccessHookError = useCallback((e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${resolvedSchema.name}: Error after saving (entity is saved)`,
            message: e?.message
        });
        console.error(e);
    }, []);

    const onSaveSuccess = useCallback((updatedEntity: Entity<M>) => {

        setCurrentEntityId(updatedEntity.id);

        snackbarContext.open({
            type: "success",
            message: `${resolvedSchema.name}: Saved correctly`
        });

        setStatus("existing");
        onModifiedValues(false);

        if (tabsPosition === -1)
            sideEntityController.close();

    }, []);

    const onSaveFailure = useCallback((e: Error) => {

        snackbarContext.open({
            type: "error",
            title: `${resolvedSchema.name}: Error saving`,
            message: e?.message
        });

        console.error("Error saving entity", path, entityId);
        console.error(e);
    }, []);

    const onEntitySave = useCallback(async ({
                                                schema,
                                                path,
                                                entityId,
                                                values,
                                                previousValues
                                            }: {
        schema: EntitySchema<M>,
        path: string,
        entityId: string | undefined,
        values: EntityValues<M>,
        previousValues?: EntityValues<M>,
    }): Promise<void> => {

        if (!status)
            return;

        return saveEntityWithCallbacks({
            path,
            entityId,
            callbacks,
            values,
            previousValues,
            schema,
            status,
            dataSource,
            context,
            onSaveSuccess,
            onSaveFailure,
            onPreSaveHookError,
            onSaveSuccessHookError
        });
    }, [status, callbacks, dataSource, context, onSaveSuccess, onSaveFailure, onPreSaveHookError, onSaveSuccessHookError]);

    const onDiscard = useCallback(() => {
        if (tabsPosition === -1)
            sideEntityController.close();
    }, [tabsPosition]);

    const body = !readOnly
? (
            <Suspense fallback={<CircularProgressCenter/>}>
                <EntityForm
                    key={`form_${path}_${entity?.id ?? "new"}`}
                    status={status}
                    path={path}
                    schema={schema}
                    onEntitySave={onEntitySave}
                    onDiscard={onDiscard}
                    onValuesChanged={setModifiedValues}
                    onModified={onModifiedValues}
                    entity={entity}/>
            </Suspense>
    )
: (
        <Suspense fallback={<CircularProgressCenter/>}>
            <EntityPreview
                entity={entity}
                path={path}
                schema={resolvedSchema}/>
        </Suspense>
    );

    const customViewsView: JSX.Element[] | undefined = customViews && customViews.map(
        (customView, colIndex) => {
            return (
                <Box
                    sx={{
                        width: TAB_WIDTH,
                        height: "100%",
                        overflow: "auto",
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        [theme.breakpoints.down("lg")]: {
                            borderLeft: "inherit",
                            width: CONTAINER_FULL_WIDTH
                        }
                    }}
                    key={`custom_view_${customView.path}_${colIndex}`}
                    role="tabpanel"
                    flexGrow={1}
                    hidden={tabsPosition !== colIndex}>
                    <ErrorBoundary>
                        {customView.builder({
                            schema: resolvedSchema,
                            entity,
                            modifiedValues: modifiedValues ?? entity?.values
                        })}
                    </ErrorBoundary>
                </Box>
            );
        }
    );

    const subCollectionsViews = subcollections && subcollections.map(
        (subcollection, colIndex) => {
            const absolutePath = entity ? `${entity?.path}/${entity?.id}/${removeInitialAndTrailingSlashes(subcollection.path)}` : undefined;

            return (
                <Box
                    sx={{
                        width: TAB_WIDTH,
                        height: "100%",
                        overflow: "auto",
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        [theme.breakpoints.down("lg")]: {
                            borderLeft: "inherit",
                            width: CONTAINER_FULL_WIDTH
                        }
                    }}
                    key={`subcol_${subcollection.name}_${colIndex}`}
                    role="tabpanel"
                    flexGrow={1}
                    hidden={tabsPosition !== colIndex + customViewsCount}>
                    {entity && absolutePath
                        ? <Suspense fallback={<CircularProgressCenter/>}>
                            <EntityCollectionView
                                path={absolutePath}
                                collection={subcollection}/>
                        </Suspense>
                        : <Box m={3}
                             display={"flex"}
                             alignItems={"center"}
                             justifyContent={"center"}>
                            <Box>
                                You need to save your entity before
                                adding additional collections
                            </Box>
                        </Box>
                    }
                </Box>
            );
        }
    );

    const getSelectedSubpath = useCallback((value: number) => {
        if (value === -1) return undefined;

        if (customViews && value < customViewsCount) {
            return customViews[value].path;
        }

        if (subcollections) {
            return subcollections[value - customViewsCount].path;
        }

        throw Error("Something is wrong in getSelectedSubpath");
    }, [customViews]);

    const onSideTabClick = useCallback((value: number) => {
        setTabsPosition(value);
        if (entityId) {
            sideEntityController.open({
                path,
                entityId,
                selectedSubpath: getSelectedSubpath(value),
                updateUrl: true
            });
        }
    }, []);

    const header = (
        <Box sx={{
            paddingLeft: 2,
            paddingRight: 2,
            paddingTop: 2,
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.palette.mode === "light" ? theme.palette.background.default : theme.palette.background.paper
        }}
        >

            <IconButton onClick={(e) => sideEntityController.close()}
                        size="large">
                <CloseIcon/>
            </IconButton>

            <Tabs
                value={tabsPosition === -1 ? 0 : false}
                indicatorColor="secondary"
                textColor="inherit"
                scrollButtons="auto"
            >
                <Tab
                    label={resolvedSchema.name}
                    sx={{
                        fontSize: "0.875rem",
                        minWidth: "140px"
                    }}
                    wrapped={true}
                    onClick={() => {
                        onSideTabClick(-1);
                    }}/>
            </Tabs>

            <Box flexGrow={1}/>

            {dataLoading &&
            <CircularProgress size={16} thickness={8}/>}

            <Tabs
                value={tabsPosition >= 0 ? tabsPosition : false}
                indicatorColor="secondary"
                textColor="inherit"
                onChange={(ev, value) => {
                    onSideTabClick(value);
                }}
                sx={{
                    paddingLeft: theme.spacing(1),
                    paddingRight: theme.spacing(1),
                    paddingTop: theme.spacing(0)
                }}
                variant="scrollable"
                scrollButtons="auto"
            >

                {customViews && customViews.map(
                    (view) =>
                        <Tab
                            sx={{
                                fontSize: "0.875rem",
                                minWidth: "140px"
                            }}
                            wrapped={true}
                            key={`entity_detail_custom_tab_${view.name}`}
                            label={view.name}/>
                )}

                {subcollections && subcollections.map(
                    (subcollection) =>
                        <Tab
                            sx={{
                                fontSize: "0.875rem",
                                minWidth: "140px"
                            }}
                            wrapped={true}
                            key={`entity_detail_collection_tab_${subcollection.name}`}
                            label={subcollection.name}/>
                )}

            </Tabs>
        </Box>

    );

    const mainViewSelected = tabsPosition === -1;
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                [theme.breakpoints.down("sm")]: {
                    width: CONTAINER_FULL_WIDTH
                },
                transition: "width 250ms ease-in-out",
                width: !mainViewSelected ? `calc(${TAB_WIDTH} + ${resolvedWidth ?? CONTAINER_WIDTH})` : resolvedWidth ?? CONTAINER_WIDTH,
                [theme.breakpoints.down("lg")]: {
                    width: !mainViewSelected ? CONTAINER_FULL_WIDTH : undefined
                }
            }}>
            {
 <>

                        {header}

                        <Divider/>

                        <Box sx={{
                            flexGrow: 1,
                            height: "100%",
                            width: `calc(${TAB_WIDTH} + ${resolvedWidth})`,
                            [theme.breakpoints.down("sm")]: {
                                width: CONTAINER_FULL_WIDTH
                            },
                            display: "flex",
                            overflow: "auto",
                            flexDirection: "row"
                        }}>

                            {dataLoading
                                ? <CircularProgressCenter/>
                                : <Box
                                    role="tabpanel"
                                    hidden={!largeLayout && !mainViewSelected}
                                    sx={{
                                        width: resolvedWidth,
                                        maxWidth: "100%",
                                        height: "100%",
                                        overflow: "auto",
                                        [theme.breakpoints.down("sm")]: {
                                            maxWidth: CONTAINER_FULL_WIDTH,
                                            width: CONTAINER_FULL_WIDTH
                                        }
                                    }}>
                                    {body}
                                </Box>}

                            {customViewsView}

                            {subCollectionsViews}

                        </Box>

                    </>
            }

        </Box>
    );
}
