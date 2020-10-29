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
    createStyles,
    Grid,
    makeStyles,
    Theme,
    Typography
} from "@material-ui/core";
import { BreadcrumbEntry, getEntityPath } from "./navigation";
import { CircularProgressCenter } from "../components";
import SubCollectionsView from "../collection/SubCollectionsView";
import { useSelectedEntityContext } from "../selected_entity_controller";
import { useBreadcrumbsContext } from "../breadcrumbs_controller";
import { useSnackbarContext } from "../snackbar_controller";
import { Prompt, useHistory, useParams, useRouteMatch } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            padding: theme.spacing(5),
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
        }
    })
);

interface EntityRouteProps<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    collectionPath: string;
    breadcrumbs: BreadcrumbEntry[];
}

export function EntityFormRoute<S extends EntitySchema>({
                                                            view,
                                                            collectionPath,
                                                            breadcrumbs
                                                        }: EntityRouteProps<S>) {

    const entityId: string = useParams()["entityId"];

    const { path, url } = useRouteMatch();
    const history = useHistory();

    const classes = useStyles();
    const snackbarContext = useSnackbarContext();
    const breadcrumbsContext = useBreadcrumbsContext();
    useEffect(() => {
        breadcrumbsContext.set({
            breadcrumbs: breadcrumbs
        });
    }, [url]);

    const [entity, setEntity] = useState<Entity<S>>();
    const [status, setStatus] = useState<EntityStatus | undefined>();
    const [loading, setLoading] = useState<boolean>(true);

    // have the original values of the form changed
    const [isModified, setModified] = useState(false);

    const selectedEntityContext = useSelectedEntityContext();

    useEffect(() => {
        if (entityId) {
            console.log("Listening entity", entityId);
            const cancelSubscription = listenEntity<S>(
                collectionPath,
                entityId,
                view.schema,
                (e) => {
                    if (e) {
                        setStatus(EntityStatus.existing);
                        setEntity(e);
                        console.log("Updated entity from Firestore", e);
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


    function onSubcollectionEntityEdit(collectionPath: string,
                                       entity: Entity<S>,
                                       schema: S,
                                       subcollections?: EntityCollectionView<any>[]) {
        const entityPath = getEntityPath(entity.id, collectionPath);
        history.push(entityPath);
    }

    function onSubcollectionEntityClick(collectionPath: string,
                                        entity: Entity<S>,
                                        schema: S,
                                        subcollections?: EntityCollectionView<any>[]) {

        selectedEntityContext.open({
            entity, schema, subcollections
        });
    }

    async function onEntitySave(schema: S, collectionPath: string, id: string | undefined, values: EntityValues<S>): Promise<void> {

        if (!status)
            return;

        let continueWithSave = true;

        if (schema.onPreSave) {
            try {
                values = await schema.onPreSave({
                    schema,
                    collectionPath,
                    id,
                    values,
                    status
                });
            } catch (e) {
                continueWithSave = false;
                snackbarContext.open({
                    type: "error",
                    title: "Error before saving",
                    message: e?.message
                });
            }
        }

        if (!continueWithSave)
            return;

        return saveEntity(collectionPath, id, values)
            .then((id) => {

                snackbarContext.open({
                    type: "success",
                    message: "The item has been saved correctly"
                });

                if (status === EntityStatus.new) {
                    setLoading(true);
                    setEntity(undefined);
                    setStatus(undefined);
                    history.replace(getEntityPath(id, collectionPath));
                }

                if (schema.onSaveSuccess) {
                    try {
                        schema.onSaveSuccess({
                            schema,
                            collectionPath,
                            id,
                            values,
                            status
                        });
                    } catch (e) {
                        snackbarContext.open({
                            type: "error",
                            title: "Error after saving (entity is saved)",
                            message: e?.message
                        });
                    }
                    history.goBack();
                }

            })
            .catch((e) => {

                if (schema.onSaveFailure) {
                    schema.onSaveFailure({
                        schema,
                        collectionPath,
                        id,
                        values,
                        status
                    });
                }

                snackbarContext.open({
                    type: "error",
                    title: "Error saving",
                    message: e?.message
                });

                console.error("Error saving entity", collectionPath, entityId, values);
                console.error(e);
            });
    }

    function onDiscard() {
        console.log("onDiscard");
        history.goBack();
    }

    const existingEntity = status === EntityStatus.existing;

    const form = <EntityForm
        status={status as EntityStatus}
        collectionPath={collectionPath}
        schema={view.schema}
        onEntitySave={onEntitySave}
        onDiscard={onDiscard}
        onModified={setModified}
        entity={entity}/>;

    const subCollectionsView = view.subcollections && <SubCollectionsView
        parentCollectionPath={collectionPath}
        subcollections={view.subcollections}
        entity={entity}
        onEntityEdit={onSubcollectionEntityEdit}
        onEntityClick={onSubcollectionEntityClick}/>;

    const mainBodyWide = (
        <Box className={classes.content}>

            <Typography variant="h5" className={classes.title}>
                {existingEntity ? "Edit" : `Add New`} {view.schema.name}
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}
                    // lg={view.subcollections ? 5 : 12}
                >
                    {form}
                </Grid>

                {view.subcollections &&
                <Grid item xs={12}
                    // lg={7}
                >
                    {subCollectionsView}
                </Grid>
                }
            </Grid>

            <Prompt
                when={isModified}
                message={location =>
                    `You have unsaved changes in this ${view.schema.name}. Are you sure you want to leave this page?`
                }
            />

        </Box>);

    return loading ?
        <CircularProgressCenter/>
        :
        mainBodyWide;
}
