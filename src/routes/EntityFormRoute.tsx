import React, { useEffect, useState } from "react";
import EntityForm from "../form/EntityForm";
import {
    Entity,
    EntityCollectionView,
    EntitySchema,
    EntityStatus,
    EntityValues
} from "../models";
import { listenEntity, saveEntity } from "../firebase";
import {
    Box,
    Button,
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
import {
    BreadcrumbEntry,
    getEntityPath,
    removeInitialSlash
} from "./navigation";
import { CircularProgressCenter } from "../components";
import { useSelectedEntityContext } from "../side_dialog/SelectedEntityContext";
import { useBreadcrumbsContext } from "../BreacrumbsContext";
import { useSnackbarContext } from "../snackbar_controller";
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
import { CollectionTable } from "../collection/CollectionTable";


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

    const entityId: string = useParams()["entityId"];

    const location = useLocation();
    const { path, url } = useRouteMatch();

    const history = useHistory();

    const sideClasses = useStylesSide();
    const mainClasses = useStylesMain();

    const selectedEntityContext = useSelectedEntityContext();
    const snackbarContext = useSnackbarContext();
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
    }, [entityId, view]);

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

        if (schema.onPreSave) {
            try {
                values = await schema.onPreSave({
                    schema,
                    collectionPath,
                    id: id,
                    values,
                    status
                });
            } catch (e) {
                return;
            }
        }

        const onPreSaveHookError = (e: Error) => {
            snackbarContext.open({
                type: "error",
                title: "Error before saving",
                message: e?.message
            });
        };

        const onSaveSuccessHookError = (e: Error) => {
            snackbarContext.open({
                type: "error",
                title: `${schema.name}: Error after saving (entity is saved)`,
                message: e?.message
            });
        };

        const onSaveSuccess = (updatedEntity: Entity<S>) => {

            setEntity(updatedEntity);

            snackbarContext.open({
                type: "success",
                message: `${schema.name}: Saved correctly`
            });

            if (status === EntityStatus.new) {
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

            if (schema.onSaveFailure) {
                schema.onSaveFailure({
                    schema,
                    collectionPath,
                    id: id,
                    values,
                    status
                });
            }

            snackbarContext.open({
                type: "error",
                title: `${schema.name}: Error saving`,
                message: e?.message
            });

            console.error("Error saving entity", collectionPath, entityId, values);
            console.error(e);
        };

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

    const form = <EntityForm
        status={status as EntityStatus}
        collectionPath={collectionPath}
        schema={view.schema}
        onEntitySave={onEntitySave}
        onDiscard={onDiscard}
        onModified={setModified}
        entity={entity}
        containerRef={containerRef}/>;

    const subCollectionsView = view.subcollections && view.subcollections.map(
        (subcollectionView, colIndex) => {

            const collectionPath = entity ? `${entity?.reference.path}/${removeInitialSlash(subcollectionView.relativePath)}` : undefined;
            const onNewClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                return collectionPath && selectedEntityContext.open({ collectionPath });
            };

            return <Box
                key={`entity_detail_tab_content_${subcollectionView.name}`}
                role="tabpanel"
                flexGrow={1}
                height={"100%"}
                width={"100%"}
                hidden={tabsPosition !== colIndex + (context === "side" ? 1 : 0)}>
                {entity && collectionPath ?
                    <CollectionTable
                        collectionPath={collectionPath}
                        schema={subcollectionView.schema}
                        deleteEnabled={subcollectionView.deleteEnabled === undefined || subcollectionView.deleteEnabled}
                        additionalColumns={subcollectionView.additionalColumns}
                        defaultSize={subcollectionView.defaultSize}
                        properties={subcollectionView.properties}
                        excludedProperties={subcollectionView.excludedProperties}
                        filterableProperties={subcollectionView.filterableProperties}
                        initialFilter={subcollectionView.initialFilter}
                        onEntityDelete={(collectionPath: string, entity: Entity<any>) =>
                            subcollectionView.schema.onDelete && subcollectionView.schema.onDelete({
                                schema: subcollectionView.schema,
                                collectionPath,
                                id: entity.id,
                                entity
                            })}
                        editEnabled={true}
                        onEntityClick={(collectionPath: string, clickedEntity: Entity<any>) =>
                            onSubcollectionEntityClick(collectionPath, clickedEntity)}
                        includeToolbar={true}
                        paginationEnabled={false}
                        title={
                            <Typography variant={"caption"}
                                        color={"textSecondary"}>
                                {`/${collectionPath}`}
                            </Typography>}
                        actions={
                            <Button
                                disabled={!collectionPath}
                                onClick={onNewClick}
                                size="medium"
                                variant="outlined"
                                color="primary"
                            >
                                Add {subcollectionView.schema.name}
                            </Button>
                        }
                    />
                    :
                    <Box m={3}
                         display={"flex"}
                         alignItems={"center"}
                         justifyContent={"center"}>
                        <Box>
                            You need to save your entity before
                            adding
                            additional collections
                        </Box>
                    </Box>
                }
            </Box>;
        }
    );

    function buildMainView() {

        return (
            <Box className={mainClasses.content}>

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
                            <Box
                                className={mainClasses.subcollections}>
                                {subCollectionsView}
                            </Box>
                        </Paper>
                    </Grid>
                    }
                </Grid>

            </Box>);
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
            <Box className={sideClasses.root}>

                <Paper elevation={0} variant={"outlined"}>
                    <Box
                        className={sideClasses.header}>

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
                                label={`${existingEntity ? "Edit" : `Add New`} ${view.schema.name}`
                                }/>

                            {view.subcollections && view.subcollections.map(
                                (subcollection) =>
                                    <Tab
                                        key={`entity_detail_tab_${subcollection.name}`}
                                        label={subcollection.name}/>
                            )}
                        </Tabs>
                    </Box>

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

            </Box>);
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
