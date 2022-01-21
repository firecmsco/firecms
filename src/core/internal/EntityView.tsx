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
    Theme,
    useMediaQuery,
    useTheme
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import clsx from "clsx";
import {
    Entity,
    EntityCallbacks,
    EntityCollection,
    EntitySchema,
    EntitySchemaResolver,
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
import { computeSchema } from "../utils";

const EntityCollectionView = lazy(() => import("../components/EntityCollectionView")) as any;
const EntityForm = lazy(() => import("../../form/EntityForm")) as any;
const EntityPreview = lazy(() => import("../components/EntityPreview")) as any;

const useStylesSide = makeStyles<Theme, { containerWidth?: string }>((theme: Theme) =>
    createStyles({
        container: ({ containerWidth }) => ({
            display: "flex",
            flexDirection: "column",
            width: containerWidth,
            height: "100%",
            [theme.breakpoints.down("sm")]: {
                width: CONTAINER_FULL_WIDTH
            },
            transition: "width 250ms ease-in-out"
        }),
        containerWide: ({ containerWidth }) => ({
            width: `calc(${TAB_WIDTH} + ${containerWidth})`,
            [theme.breakpoints.down("lg")]: {
                width: CONTAINER_FULL_WIDTH
            }
        }),
        subcollectionPanel: {
            width: TAB_WIDTH,
            height: "100%",
            overflow: "auto",
            borderLeft: `1px solid ${theme.palette.divider}`,
            [theme.breakpoints.down("lg")]: {
                borderLeft: "inherit",
                width: CONTAINER_FULL_WIDTH
            }
        },
        tabsContainer: ({ containerWidth }) => ({
            flexGrow: 1,
            height: "100%",
            width: `calc(${TAB_WIDTH} + ${containerWidth})`,
            [theme.breakpoints.down("lg")]: {
                width: CONTAINER_FULL_WIDTH
            },
            display: "flex",
            overflow: "auto",
            flexDirection: "row"
        }),
        form: ({ containerWidth }) => ({
            width: containerWidth,
            maxWidth: "100%",
            height: "100%",
            overflow: "auto",
            [theme.breakpoints.down("sm")]: {
                maxWidth: CONTAINER_FULL_WIDTH,
                width: CONTAINER_FULL_WIDTH
            }
        }),
        tabBar: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            paddingTop: theme.spacing(0)
        },
        tab: {
            fontSize: "0.875rem",
            minWidth: "140px"
        }
    })
);


export interface EntityViewProps<M, UserType> {
    path: string;
    schema: EntitySchema<M> | EntitySchemaResolver<M>;
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
                                                                           schema: schemaOrResolver,
                                                                           subcollections,
                                                                           onModifiedValues,
                                                                           width
                                                                       }: EntityViewProps<M, UserType>) {

    const resolvedWidth: string | undefined = typeof width === "number" ? `${width}px` : width;
    const classes = useStylesSide({ containerWidth: resolvedWidth ?? CONTAINER_WIDTH });

    const dataSource = useDataSource();
    const sideEntityController = useSideEntityController();
    const snackbarContext = useSnackbarController();
    const context = useFireCMSContext();
    const authController = useAuthController<UserType>();

    const [status, setStatus] = useState<EntityStatus>(copy ? "copy" : (entityId ? "existing" : "new"));
    const [currentEntityId, setCurrentEntityId] = useState<string | undefined>(entityId);
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [tabsPosition, setTabsPosition] = React.useState(-1);

    const [modifiedValues, setModifiedValues] = useState<EntityValues<any> | undefined>();

    const {
        entity,
        dataLoading,
        // eslint-disable-next-line no-unused-vars
        dataLoadingError
    } = useEntityFetch({
        path,
        entityId: currentEntityId,
        schema: schemaOrResolver,
        useCache: false
    });

    const resolvedSchema:ResolvedEntitySchema<M> = useMemo(() => computeSchema({
        schemaOrResolver,
        path,
        entityId,
        values: modifiedValues,
        previousValues: entity?.values
    }), [schemaOrResolver, path, entityId, modifiedValues]);

    useEffect(() => {
        function beforeunload(e: any) {
            if (modifiedValues) {
                e.preventDefault();
                e.returnValue = `You have unsaved changes in this ${resolvedSchema.name}. Are you sure you want to leave this page?`;
            }
        }

        if (typeof window !== "undefined")
            window.addEventListener("beforeunload", beforeunload);

        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("beforeunload", beforeunload);
        };

    }, [modifiedValues, window]);

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
    }, [sideEntityController, tabsPosition]);

    const body = !readOnly
? (
            <Suspense fallback={<CircularProgressCenter/>}>
                <EntityForm
                    key={`form_${path}_${entity?.id ?? "new"}`}
                    status={status}
                    path={path}
                    schemaOrResolver={schemaOrResolver}
                    onEntitySave={onEntitySave as any}
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
                    className={classes.subcollectionPanel}
                    key={`custom_view_${customView.path}_${colIndex}`}
                    role="tabpanel"
                    flexGrow={1}
                    height={"100%"}
                    width={"100%"}
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
                    className={classes.subcollectionPanel}
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
                overrideSchemaRegistry: false
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
                    classes={{
                        root: classes.tab
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
                className={classes.tabBar}
                variant="scrollable"
                scrollButtons="auto"
            >

                {customViews && customViews.map(
                    (view) =>
                        <Tab
                            classes={{
                                root: classes.tab
                            }}
                            wrapped={true}
                            key={`entity_detail_custom_tab_${view.name}`}
                            label={view.name}/>
                )}

                {subcollections && subcollections.map(
                    (subcollection) =>
                        <Tab
                            classes={{
                                root: classes.tab
                            }}
                            wrapped={true}
                            key={`entity_detail_collection_tab_${subcollection.name}`}
                            label={subcollection.name}/>
                )}

            </Tabs>
        </Box>

    );

    return <div
        className={clsx(classes.container, { [classes.containerWide]: tabsPosition !== -1 })}>
        {
            dataLoading
                ? <CircularProgressCenter/>
                : <>

                    {header}

                    <Divider/>

                    <div className={classes.tabsContainer}>

                        <Box
                            role="tabpanel"
                            hidden={!largeLayout && tabsPosition !== -1}
                            className={classes.form}>
                            {body}
                        </Box>

                        {customViewsView}

                        {subCollectionsViews}

                    </div>

                </>
        }

    </div>;
}

