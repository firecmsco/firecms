import React, { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Theme,
    useMediaQuery,
    useTheme
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import {
    useBlocker,
    useLocation,
    useMatch,
    useNavigate
} from "react-router-dom";
import clsx from "clsx";
import EntityForm from "../../form/EntityForm";
import {
    Entity,
    EntityCollection,
    EntitySchema,
    EntityStatus,
    EntityValues,
    PermissionsBuilder
} from "../../models";
import { EntityCollectionTable } from "../components/EntityCollectionTable";
import {
    removeInitialAndTrailingSlashes
} from "../util/navigation_utils";
import CircularProgressCenter from "../components/CircularProgressCenter";
import EntityPreview from "../components/EntityPreview";

import { CONTAINER_FULL_WIDTH, CONTAINER_WIDTH, TAB_WIDTH } from "./common";
import ErrorBoundary from "./ErrorBoundary";
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
import { EntityCallbacks } from "../../models/entity_callbacks";

const useStylesSide = makeStyles((theme: Theme) =>
    createStyles({
        container: {
            display: "flex",
            flexDirection: "column",
            width: CONTAINER_WIDTH,
            height: "100%",
            [theme.breakpoints.down("sm")]: {
                width: CONTAINER_FULL_WIDTH
            },
            transition: "width 250ms ease-in-out"
        },
        containerWide: {
            width: `calc(${TAB_WIDTH} + ${CONTAINER_WIDTH})`,
            [theme.breakpoints.down("lg")]: {
                width: CONTAINER_FULL_WIDTH
            }
        },
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
        tabsContainer: {
            flexGrow: 1,
            height: "100%",
            width: `calc(${TAB_WIDTH} + ${CONTAINER_WIDTH})`,
            [theme.breakpoints.down("lg")]: {
                width: CONTAINER_FULL_WIDTH
            },
            display: "flex",
            overflow: "auto",
            flexDirection: "row"
        },
        form: {
            width: CONTAINER_WIDTH,
            maxWidth: "100%",
            height: "100%",
            overflow: "auto",
            [theme.breakpoints.down("sm")]: {
                maxWidth: CONTAINER_FULL_WIDTH,
                width: CONTAINER_FULL_WIDTH
            }
        },
        tabBar: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
            paddingTop: theme.spacing(0)
        },
        tab: {
            fontSize: "0.875rem",
            minWidth: "140px"
        },
        header: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            paddingTop: theme.spacing(2),
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.palette.background.paper
        }

    })
);


export interface SideEntityViewProps<M extends { [Key: string]: any }> {
    path: string;
    schema: EntitySchema;
    entityId?: string;
    copy?: boolean;
    selectedSubpath?: string;
    permissions?: PermissionsBuilder<M>;
    callbacks?: EntityCallbacks<M>;
    subcollections?: EntityCollection[];
}


function SideEntityView<M extends { [Key: string]: any }>({
                                                              path,
                                                              entityId,
                                                              callbacks,
                                                              selectedSubpath,
                                                              copy,
                                                              permissions,
                                                              schema,
                                                              subcollections
                                                          }: SideEntityViewProps<M>) {

    const classes = useStylesSide();

    const dataSource = useDataSource();
    const sideEntityController = useSideEntityController();
    const snackbarContext = useSnackbarController();
    const context = useFireCMSContext();
    const authController = useAuthController();

    const [status, setStatus] = useState<EntityStatus>(copy ? "copy" : (entityId ? "existing" : "new"));
    const [currentEntityId, setCurrentEntityId] = useState<string | undefined>(entityId);
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [tabsPosition, setTabsPosition] = React.useState(-1);

    // have the original values of the form changed?
    const [isModified, setModified] = useState(false);
    const [modifiedValues, setModifiedValues] = useState<EntityValues<any> | undefined>();

    const customViews = schema.views;
    const customViewsCount = customViews?.length ?? 0;
    const navigate = useNavigate();

    useBlocker(({ action, location: nextLocation, retry }) => {
            switch (action) {
                case "PUSH":
                case "REPLACE": {
                    retry();
                    return;
                }
                case "POP": {
                    const answer = confirm(`You have unsaved changes in this ${schema.name}. Are you sure you want to leave this page?`);
                    if (answer) {
                        navigate(nextLocation);
                    }
                    return;
                }
            }
        },
        isModified
    );

    const {
        entity,
        dataLoading,
        dataLoadingError
    } = useEntityFetch({ path, entityId: currentEntityId, schema });

    useEffect(() => {
        if (entity)
            setReadOnly(!canEdit(permissions, entity, authController, path, context));
    }, [entity]);

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

    useEffect(() => {
        function beforeunload(e: any) {
            if (isModified) {
                e.preventDefault();
                e.returnValue = `You have unsaved changes in this ${schema.name}. Are you sure you want to leave this page?`;
            }
        }

        if (typeof window !== "undefined")
            window.addEventListener("beforeunload", beforeunload);

        return () => {
            if (typeof window !== "undefined")
                window.removeEventListener("beforeunload", beforeunload);
        };

    }, [window]);

    const onPreSaveHookError = (e: Error) => {
        snackbarContext.open({
            type: "error",
            title: "Error before saving",
            message: e?.message
        });
        console.error(e);
    };

    const onSaveSuccessHookError = (e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${schema.name}: Error after saving (entity is saved)`,
            message: e?.message
        });
        console.error(e);
    };

    const onSaveSuccess = (updatedEntity: Entity<M>) => {

        setCurrentEntityId(updatedEntity.id);

        snackbarContext.open({
            type: "success",
            message: `${schema.name}: Saved correctly`
        });

        setStatus("existing");
        setModified(false);

        if (tabsPosition === -1)
            sideEntityController.close();

    };

    const onSaveFailure = (e: Error) => {

        snackbarContext.open({
            type: "error",
            title: `${schema.name}: Error saving`,
            message: e?.message
        });

        console.error("Error saving entity", path, entityId);
        console.error(e);
    };

    async function onEntitySave({
                                    schema,
                                    path,
                                    entityId,
                                    values
                                }: { schema: EntitySchema<M>, path: string, entityId: string | undefined, values: EntityValues<M> }): Promise<void> {

        if (!status)
            return;

        if (status === "existing" && !isModified) {
            sideEntityController.close();
            return;
        }

        return saveEntityWithCallbacks({
            path,
            entityId: entityId,
            callbacks,
            values,
            schema,
            status,
            dataSource,
            context,
            onSaveSuccess,
            onSaveFailure,
            onPreSaveHookError,
            onSaveSuccessHookError
        });
    }

    function onDiscard() {
        if (tabsPosition === -1)
            sideEntityController.close();
    }

    const form = !readOnly ? (
        <EntityForm
            status={status}
            path={path}
            schema={schema}
            onEntitySave={onEntitySave}
            onDiscard={onDiscard}
            onValuesChanged={setModifiedValues}
            onModified={setModified}
            entity={entity}/>
    ) : (
        <EntityPreview
            entity={entity as any}
            schema={schema}/>
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
                            schema,
                            entity,
                            modifiedValues: isModified ? modifiedValues : entity?.values
                        })}
                    </ErrorBoundary>
                </Box>
            );
        }
    );

    const subCollectionsViews = subcollections && subcollections.map(
        (subcollection, colIndex) => {
            const path = entity ? `${entity?.path}/${entity?.id}/${removeInitialAndTrailingSlashes(subcollection.path)}` : undefined;

            return (
                <Box
                    className={classes.subcollectionPanel}
                    key={`subcol_${subcollection.name}_${colIndex}`}
                    role="tabpanel"
                    flexGrow={1}
                    hidden={tabsPosition !== colIndex + customViewsCount}>
                    {entity && path ?
                        <EntityCollectionTable path={path}
                                               collection={subcollection}
                        />
                        :
                        <Box m={3}
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

    function getSelectedSubpath(value: number) {
        if (value == -1) return undefined;

        if (customViews && value < customViewsCount) {
            return customViews[value].path;
        }

        if (subcollections) {
            return subcollections[value - customViewsCount].path;
        }

        throw Error("Something is wrong in getSelectedSubpath");
    }

    function onSideTabClick(value: number) {
        setTabsPosition(value);
        if (entityId) {
            sideEntityController.open({
                path,
                entityId,
                selectedSubpath: getSelectedSubpath(value),
                overrideSchemaResolver: false
            });
        }
    }

    const header = <Paper elevation={0} variant={"outlined"}>
        <div className={classes.header}>

            <IconButton onClick={(e) => sideEntityController.close()}
                        size="large">
                <CloseIcon/>
            </IconButton>

            <Tabs
                value={tabsPosition == -1 ? 0 : false}
                indicatorColor="secondary"
                textColor="inherit"
                scrollButtons="auto"
            >
                <Tab
                    label={schema.name}
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
        </div>

    </Paper>;

    return <div
        className={clsx(classes.container, { [classes.containerWide]: tabsPosition !== -1 })}>
        {
            dataLoading ?
                <CircularProgressCenter/>
                :
                <>

                    {header}

                    <div className={classes.tabsContainer}>

                        <Box
                            role="tabpanel"
                            hidden={!largeLayout && tabsPosition !== -1}
                            className={classes.form}>
                            {form}
                        </Box>

                        {customViewsView}

                        {subCollectionsViews}

                    </div>

                </>
        }
    </div>;
}

export default React.memo(SideEntityView);
