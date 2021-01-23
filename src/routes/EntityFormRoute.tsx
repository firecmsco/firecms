import React, { useEffect, useState } from "react";
import EntityForm from "../form/EntityForm";
import {
    Entity,
    EntityCollectionView,
    EntitySchema,
    EntityStatus,
    EntityValues
} from "../models";
import { listenEntity, saveEntity } from "../models/firestore";
import {
    Box,
    createStyles,
    Grid,
    IconButton,
    makeStyles,
    Paper,
    Tab,
    Tabs,
    Theme,
    Typography
} from "@material-ui/core";
import { BreadcrumbEntry, getEntityPath } from "./navigation";
import { CircularProgressCenter } from "../components";
import { useSelectedEntityContext } from "../side_dialog/SelectedEntityContext";
import { useBreadcrumbsContext, useSnackbarController } from "../contexts";
import {
    Link as ReactLink,
    Prompt,
    useHistory,
    useLocation,
    useParams,
    useRouteMatch
} from "react-router-dom";
import CloseIcon from "@material-ui/icons/Close";
import OpenInBrowserIcon from "@material-ui/icons/OpenInBrowser";
import { EntityPreview } from "../preview";
import { EntityFormSubCollection } from "../collection/EntitySubcollection";


const useStylesSide = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            height: "100%",
            display: "flex",
            flexDirection: "column"
        },
        container: {
            flexGrow: 1,
            height: "100%",
            overflow: "auto"
        },
        tabBar: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            paddingTop: theme.spacing(1),
            [theme.breakpoints.down("sm")]: {
                paddingLeft: theme.spacing(1),
                paddingRight: theme.spacing(1),
                paddingTop: theme.spacing(0)
            }
        },
        form: {
            padding: theme.spacing(3),
            [theme.breakpoints.down("sm")]: {
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(2),
                paddingTop: theme.spacing(3),
                paddingBottom: theme.spacing(3)
            },
            [theme.breakpoints.down("xs")]: {
                paddingLeft: theme.spacing(0),
                paddingRight: theme.spacing(0),
                paddingTop: theme.spacing(2),
                paddingBottom: theme.spacing(1)
            }
        },
        header: {
            paddingLeft: theme.spacing(2),
            paddingRight: theme.spacing(2),
            paddingTop: theme.spacing(2),
            display: "flex",
            alignItems: "center",
            backgroundColor: theme.palette.common.white
        }

    })
);

const useStylesMain = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            padding: theme.spacing(3),
            [theme.breakpoints.down("sm")]: {
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(2),
                paddingTop: theme.spacing(3),
                paddingBottom: theme.spacing(3)
            },
            [theme.breakpoints.down("xs")]: {
                paddingLeft: theme.spacing(0),
                paddingRight: theme.spacing(0),
                paddingTop: theme.spacing(2),
                paddingBottom: theme.spacing(1)
            }
        },
        formPaper: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
            padding: theme.spacing(4),
            [theme.breakpoints.down("md")]: {
                padding: theme.spacing(2)
            },
            [theme.breakpoints.down("xs")]: {
                padding: theme.spacing(1)
            }
        },
        title: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(3),
            [theme.breakpoints.down("sm")]: {
                paddingTop: theme.spacing(1),
                paddingBottom: theme.spacing(2)
            },
            [theme.breakpoints.down("xs")]: {
                padding: theme.spacing(1)
            }
        },
        subcollections: {
            height: "calc(100vh - 148px)"
        }

    })
);


/**
 * Is this form displayed as the main route or in the lateral menu
 */
type FormContext = "main" | "side";

interface EntityRouteProps<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    collectionPath: string;
    breadcrumbs?: BreadcrumbEntry[];
    context: FormContext;
}


function EntityFormRoute<S extends EntitySchema>({
                                                     view,
                                                     collectionPath,
                                                     breadcrumbs,
                                                     context
                                                 }: EntityRouteProps<S>) {

    // React router is not able to parse path and query parameters, so
    // we need to add this hack, WTF
    let entityId: string = useParams()["entityId"];
    if (entityId && entityId.includes("?"))
        entityId = entityId.substring(0, entityId.indexOf("?"));

    const location = useLocation();
    const query = new URLSearchParams(window.location.search);
    const { path, url, params } = useRouteMatch();

    const copyEntityMode = window.location.search?.includes("copy");

    const history = useHistory();

    const sideClasses = useStylesSide();
    const mainClasses = useStylesMain();

    const selectedEntityContext = useSelectedEntityContext();
    const snackbarContext = useSnackbarController();
    const breadcrumbsContext = useBreadcrumbsContext();

    useEffect(() => {
        if (breadcrumbs)
            breadcrumbsContext.set({
                breadcrumbs: breadcrumbs
            });
    }, [url]);

    const [entity, setEntity] = useState<Entity<S>>();
    const [status, setStatus] = useState<EntityStatus | undefined>();
    const [loading, setLoading] = useState<boolean>(true);
    const [tabsPosition, setTabsPosition] = React.useState(0);

    // have the original values of the form changed
    const [isModified, setModified] = useState(false);

    useEffect(() => {
        if (entityId) {
            const cancelSubscription = listenEntity<S>(
                collectionPath,
                entityId,
                view.schema,
                (e) => {
                    if (e) {
                        if (copyEntityMode)
                            setStatus(EntityStatus.copy);
                        else
                            setStatus(EntityStatus.existing);
                        setEntity(e);
                        console.debug("Updated entity from Firestore", e);
                    }
                    setLoading(false);
                });
            return () => cancelSubscription();
        } else {
            setStatus(EntityStatus.new);
            setLoading(false);
        }
        return () => {
        };
    }, [entityId, view, copyEntityMode]);

    useEffect(() => {
        if (view.subcollections && location["subcollection"]) {
            const index = view.subcollections
                .map((c) => c.relativePath)
                .findIndex((p) => p === location["subcollection"]);
            setTabsPosition(index + 1);
        }
    }, [location["subcollection"]]);


    function onSubcollectionEntityClick(collectionPath: string,
                                        entity: Entity<S>) {
        selectedEntityContext.open({
            entityId: entity.id,
            collectionPath
        });
    }

    async function onEntitySave(schema: S, collectionPath: string, id: string | undefined, values: EntityValues<S>): Promise<void> {

        if (!status)
            return;

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

        const onSaveSuccess = (updatedEntity: Entity<S>) => {

            setEntity(updatedEntity);

            snackbarContext.open({
                type: "success",
                message: `${schema.name}: Saved correctly`
            });

            if (status === EntityStatus.new || status === EntityStatus.copy) {
                setLoading(true);
                setEntity(undefined);
                setStatus(undefined);
                if (context === "main")
                    history.replace(getEntityPath(updatedEntity.id, collectionPath));
                else if (context === "side")
                    selectedEntityContext.replace({
                        entityId: updatedEntity.id,
                        collectionPath
                    });
                else throw Error("Missing mapping for entity context when saving");
            }

            setModified(false);
            history.goBack();

        };

        const onSaveFailure = (e: Error) => {

            snackbarContext.open({
                type: "error",
                title: `${schema.name}: Error saving`,
                message: e?.message
            });

            console.error("Error saving entity", collectionPath, entityId, values);
            console.error(e);
        };

        if (status === EntityStatus.existing && !isModified) {
            history.goBack();
            return;
        }

        return saveEntity({
            collectionPath,
            id,
            values,
            schema,
            status,
            onSaveSuccess,
            onSaveFailure,
            onPreSaveHookError,
            onSaveSuccessHookError
        });
    }

    function onDiscard() {
        history.goBack();
    }

    const existingEntity = status === EntityStatus.existing;

    const containerRef = React.useRef<HTMLDivElement>(null);

    const editEnabled = view.editEnabled == undefined || view.editEnabled;
    const form = editEnabled ? (
        <EntityForm
            status={status as EntityStatus}
            collectionPath={collectionPath}
            schema={view.schema}
            onEntitySave={onEntitySave}
            onDiscard={onDiscard}
            onModified={setModified}
            entity={entity}
            containerRef={containerRef}/>
    ) : (
        <EntityPreview
            entity={entity as any}
            schema={view.schema}/>
    );

    const subCollectionsView = view.subcollections && view.subcollections.map(
        (subcollectionView, colIndex) => {
            return EntityFormSubCollection({
                entity: entity as Entity<S>,
                view: subcollectionView,
                onSubcollectionEntityClick,
                tabsPosition,
                colIndex,
                context
            });
        }
    );

    function buildMainView() {

        return (
            <div className={mainClasses.content}>

                <Typography variant="h5" className={mainClasses.title}>
                    {existingEntity ? "Edit" : `Add New`} {view.schema.name}
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12}
                        // lg={view.subcollections ? 5 : 12}
                    >
                        <Paper
                            className={mainClasses.formPaper}>
                            {form}
                        </Paper>
                    </Grid>

                    {view.subcollections &&
                    <Grid item xs={12}
                        // lg={7}
                    >
                        <Paper
                            style={{ height: "100%" }}>

                            <Tabs value={tabsPosition}
                                  variant="scrollable"
                                  scrollButtons="auto"
                                  indicatorColor="secondary"
                                  textColor="inherit"
                                  onChange={(ev, value) => setTabsPosition(value)}>
                                {view.subcollections && view.subcollections.map(
                                    (subcollection) =>
                                        <Tab
                                            key={`entity_detail_tab_${subcollection.name}`}
                                            label={subcollection.name}/>
                                )}
                            </Tabs>
                            <div
                                className={mainClasses.subcollections}>
                                {subCollectionsView}
                            </div>
                        </Paper>
                    </Grid>
                    }
                </Grid>

            </div>);
    }

    function onSideTabClick(value: number) {
        setTabsPosition(value);
        if (view.subcollections) {
            selectedEntityContext.replace({
                collectionPath,
                entityId,
                subcollection: value !== 0
                    ? view.subcollections[value - 1].relativePath
                    : undefined
            });
        }
    }

    function buildSideView() {

        return (
            <div className={sideClasses.root}>

                <Paper elevation={0} variant={"outlined"}>
                    <div className={sideClasses.header}>

                        <IconButton
                            onClick={(e) => selectedEntityContext.close()}>
                            <CloseIcon/>
                        </IconButton>

                        {entity &&
                        <IconButton component={ReactLink}
                                    to={getEntityPath(entityId, collectionPath)}>
                            <OpenInBrowserIcon/>
                        </IconButton>
                        }

                        <Box flexGrow={1}/>

                        <Tabs
                            value={tabsPosition}
                            indicatorColor="secondary"
                            textColor="inherit"
                            onChange={(ev, value) => {
                                onSideTabClick(value);
                            }}
                            className={sideClasses.tabBar}
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            <Tab
                                label={`${editEnabled ? (existingEntity ? "Edit" : `Add New`) : ""} ${view.schema.name}`
                                }/>

                            {view.subcollections && view.subcollections.map(
                                (subcollection) =>
                                    <Tab
                                        key={`entity_detail_tab_${subcollection.name}`}
                                        label={subcollection.name}/>
                            )}
                        </Tabs>
                    </div>

                </Paper>

                <div className={sideClasses.container} ref={containerRef}>
                    <Box
                        role="tabpanel"
                        hidden={tabsPosition !== 0}
                        className={sideClasses.form}>
                        {form}
                    </Box>

                    {subCollectionsView}

                </div>

            </div>);
    }


    return loading ?
        <CircularProgressCenter/>
        :
        <React.Fragment>

            {context === "side" && buildSideView()}
            {context === "main" && buildMainView()}

            <Prompt
                when={isModified}
                message={location =>
                    `You have unsaved changes in this ${view.schema.name}. Are you sure you want to leave this page?`
                }
            />
        </React.Fragment>;
}

export default React.memo(EntityFormRoute);
