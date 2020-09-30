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
import { Box, Grid, Snackbar, Typography } from "@material-ui/core";
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

    const handleCloseSuccessAlert = (event?: React.SyntheticEvent, reason?: string) => {
        setOpenSuccessAlert(false);
    };

    const handleCloseErrorAlert = (event?: React.SyntheticEvent, reason?: string) => {
        setSaveErrorAlert(undefined);
        setPreSaveErrorAlert(undefined);
        setPostSaveErrorAlert(undefined);
    };

    const [openSuccessAlert, setOpenSuccessAlert] = React.useState<boolean>(false);
    const [saveErrorAlert, setSaveErrorAlert] = React.useState<Error | undefined>(undefined);
    const [preSaveErrorAlert, setPreSaveErrorAlert] = React.useState<Error | undefined>(undefined);
    const [postSaveErrorAlert, setPostSaveErrorAlert] = React.useState<Error | undefined>(undefined);

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
                setPreSaveErrorAlert(e);
            }
        }

        if (!continueWithSave)
            return;

        return saveEntity(collectionPath, id, values)
            .then((id) => {
                setOpenSuccessAlert(true);

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
                        setPostSaveErrorAlert(e);
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

                setSaveErrorAlert(e);
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

    const mainBodyWide = <React.Fragment>

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

    </React.Fragment>;

    return (
        <React.Fragment>
            {loading ?
                <CircularProgressCenter/>
                :
                mainBodyWide
            }

            <Snackbar open={openSuccessAlert} autoHideDuration={3000}
                      onClose={handleCloseSuccessAlert}>
                <MuiAlert elevation={6} variant="filled"
                          onClose={handleCloseSuccessAlert} severity="success">
                    The item has been saved correctly
                </MuiAlert>
            </Snackbar>

            <Snackbar open={!!saveErrorAlert} autoHideDuration={3000}
                      onClose={handleCloseErrorAlert}>
                <MuiAlert elevation={6} variant="filled"
                          onClose={handleCloseErrorAlert}
                          severity="error">
                    <Box>Error saving</Box>
                    <Box>{saveErrorAlert?.message}</Box>
                </MuiAlert>
            </Snackbar>

            <Snackbar open={!!preSaveErrorAlert} autoHideDuration={3000}
                      onClose={handleCloseErrorAlert}>
                <MuiAlert elevation={6} variant="filled"
                          onClose={handleCloseErrorAlert}
                          severity="error">
                    <Box>Error before saving</Box>
                    <Box>{preSaveErrorAlert?.message}</Box>
                </MuiAlert>
            </Snackbar>

            <Snackbar open={!!postSaveErrorAlert} autoHideDuration={3000}
                      onClose={handleCloseErrorAlert}>
                <MuiAlert elevation={6} variant="filled"
                          onClose={handleCloseErrorAlert}
                          severity="error">
                    <Box>Error after saving</Box>
                    <Box>The entity has been saved</Box>
                    <Box>{postSaveErrorAlert?.message}</Box>
                </MuiAlert>
            </Snackbar>

        </React.Fragment>
    );
}
