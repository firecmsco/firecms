import React, { useEffect, useState } from "react";
import EntityForm from "../form/EntityForm";
import { RouteComponentProps } from "react-router";
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
    Snackbar,
    Theme,
    Typography
} from "@material-ui/core";
import {
    BreadcrumbEntry,
    getEntityPath,
    getPlaceHolderIdForView,
    replacePathIdentifiers
} from "./navigation";
import { CircularProgressCenter } from "../components";
import SubCollectionsView from "../collection/SubCollectionsView";
import MuiAlert from "@material-ui/lab/Alert/Alert";
import { useSelectedEntityContext } from "../selected_entity_controller";
import { useBreadcrumbsContext } from "../breadcrumbs_controller";
import { useSnackbarContext } from "../snackbar_controller";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            padding: theme.spacing(5),
            [theme.breakpoints.down("sm")]: {
                paddingLeft: theme.spacing(2),
                paddingRight: theme.spacing(2),
                paddingTop: theme.spacing(3),
                paddingBottom: theme.spacing(3),
            },
            [theme.breakpoints.down("xs")]: {
                paddingLeft: theme.spacing(0),
                paddingRight: theme.spacing(0),
                paddingTop: theme.spacing(2),
                paddingBottom: theme.spacing(2),
            },
        }
    })
);

interface EntityRouteProps<S extends EntitySchema> {
    view: EntityCollectionView<S>;
    entityPlaceholderPath: string,
    breadcrumbs: BreadcrumbEntry[]
}

type EntityParamsProps = Record<string, string>;


export function EntityFormRoute<S extends EntitySchema>({
                                                            view,
                                                            entityPlaceholderPath,
                                                            breadcrumbs,
                                                            match,
                                                            history,
                                                            ...props
                                                        }: EntityRouteProps<S> & RouteComponentProps<EntityParamsProps>) {
    let entityId: string | undefined;
    let collectionPath: string;
    let params: Record<string, string>;

    const hashIdentifier = getPlaceHolderIdForView(entityPlaceholderPath, view);
    params = match.params;

    collectionPath = replacePathIdentifiers(params, entityPlaceholderPath);
    console.debug("Entity collection path", collectionPath);

    const classes = useStyles();
    const snackbarContext = useSnackbarContext();

    const breadcrumbsContext = useBreadcrumbsContext();
    breadcrumbsContext.set({
        breadcrumbs: breadcrumbs,
        currentTitle: view.schema.name,
        pathParams: match.params
    });

    entityId = params[hashIdentifier];

    const [entity, setEntity] = useState<Entity<S>>();
    const [status, setStatus] = useState<EntityStatus | undefined>();
    const [loading, setLoading] = useState<boolean>(true);

    const selectedEntityContext = useSelectedEntityContext();

    useEffect(() => {
        if (entityId) {
            console.log("Listening entity", entityId);
            const cancelSubscription = listenEntity<S>(collectionPath,
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
    }, [collectionPath, entityId, view]);

    const backListener = history.listen(location => {
        // console.log("new location", location);
        // if (location.action === "POP") {
        //     // Do your stuff
        // }
    });


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

    const existingEntity = status === EntityStatus.existing;

    const form = <EntityForm
        status={status as EntityStatus}
        collectionPath={collectionPath}
        schema={view.schema}
        onEntitySave={onEntitySave}
        entity={entity}/>;

    const subCollectionsView = view.subcollections && <SubCollectionsView
        parentCollectionPath={collectionPath}
        subcollections={view.subcollections}
        entity={entity}
        onEntityEdit={onSubcollectionEntityEdit}
        onEntityClick={onSubcollectionEntityClick}/>;

    const mainBodyWide = (
        <Box className={classes.content}>

            <Box mb={3}>
                <Typography variant="h5">
                    {existingEntity ? "Edit" : `Add New`} {view.schema.name}
                </Typography>
            </Box>

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

        </Box>);

    return loading ?
                <CircularProgressCenter/>
                :
                mainBodyWide
          ;
}
