import React, { useEffect, useState } from "react";
import EntityForm from "../form/EntityForm";
import { RouteComponentProps } from "react-router";
import { Link as ReactLink } from "react-router-dom";
import {
    Entity,
    EntityCollectionView,
    EntitySchema,
    EntityStatus
} from "../models";
import { fetchEntity, saveEntity } from "../firebase";
import {
    Box,
    Breadcrumbs,
    Link,
    Snackbar,
    Typography
} from "@material-ui/core";
import {
    BreadcrumbEntry,
    buildDataPath,
    getEntityPath,
    getPlaceHolderIdForView,
    replacePathIdentifiers
} from "./navigation";
import { BreadcrumbContainer, CircularProgressCenter } from "../util";
import SubCollectionsView from "../collection/SubCollectionsView";
import MuiAlert from "@material-ui/lab/Alert/Alert";

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
    entityId = params[hashIdentifier];

    const [entity, setEntity] = useState<Entity<S>>();
    const [status, setStatus] = useState<EntityStatus | undefined>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (entityId) {
            fetchEntity<S>(collectionPath, entityId, view.schema)
                .then((e) => {
                    setStatus(EntityStatus.existing);
                    setEntity(e);
                })
                .finally(() => setLoading(false));
        } else {
            setStatus(EntityStatus.new);
            setLoading(false);
        }
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
        setOpenErrorAlert(false);
    };

    const [openSuccessAlert, setOpenSuccessAlert] = React.useState<boolean>(false);
    const [openErrorAlert, setOpenErrorAlert] = React.useState<boolean>(false);

    function onSubcollectionEntityClick(collectionPath: string, entity: Entity<S>) {
        const entityPath = getEntityPath(entity.id, collectionPath);
        history.push(entityPath);
    }

    function onEntitySave(collectionPath: string, id: string | undefined, values: any): Promise<void> {
        return saveEntity(collectionPath, id, values)
            .then((id) => {
                setOpenSuccessAlert(true);

                if (status === EntityStatus.new) {
                    setLoading(true);
                    setEntity(undefined);
                    setStatus(undefined);
                    history.replace(getEntityPath(id, collectionPath));
                }
                // history.goBack();
            })
            .catch((e) => {
                setOpenErrorAlert(true);
                console.error("Error saving entity", collectionPath, entityId, values);
                console.error(e);
            });
    }

    const existingEntity = status === EntityStatus.existing;

    const formBody = <React.Fragment>
        <Box mb={3}>
            <BreadcrumbContainer>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link key={`breadcrumb-home`} color="inherit"
                          component={ReactLink}
                          to="/">
                        Home
                    </Link>
                    {breadcrumbs.map(entry =>
                        (entry.placeHolderId && !params[entry.placeHolderId]) ?
                            null :
                            <Link
                                key={`breadcrumb-${entry.entityPlaceholderPath}`}
                                color="inherit"
                                component={ReactLink}
                                to={buildDataPath(replacePathIdentifiers(params, entry.entityPlaceholderPath))}>
                                {entry.placeHolderId ? params[entry.placeHolderId] : entry.view.name}
                            </Link>)
                        .filter(c => !!c)}
                    <Typography
                        color="textPrimary">{existingEntity ? "Edit" : `Add New`}</Typography>
                </Breadcrumbs>
            </BreadcrumbContainer>
        </Box>
        <Box mb={3}>
            <Typography variant="h5">
                {existingEntity ? "Edit" : `Add New`} {view.schema.name}
            </Typography>
        </Box>

        <EntityForm
            status={status as EntityStatus}
            collectionPath={collectionPath}
            schema={view.schema}
            onEntitySave={onEntitySave}
            entity={entity}/>
        {view.schema.subcollections &&
        <SubCollectionsView parentCollectionPath={collectionPath}
                            parentSchema={view.schema}
                            entity={entity}
                            onEntityClick={onSubcollectionEntityClick}/>
        }
    </React.Fragment>;

    return (
        <React.Fragment>
            {loading ?
                <CircularProgressCenter/>
                :
                formBody
            }

            <Snackbar open={openSuccessAlert} autoHideDuration={3000}
                      onClose={handleCloseSuccessAlert}>
                <MuiAlert elevation={6} variant="filled"
                          onClose={handleCloseSuccessAlert} severity="success">
                    The item has been saved correctly
                </MuiAlert>
            </Snackbar>
            <Snackbar open={openErrorAlert} autoHideDuration={3000}
                      onClose={handleCloseErrorAlert}>
                <MuiAlert elevation={6} variant="filled"
                          onClose={handleCloseErrorAlert}
                          severity="error">
                    An error occurred saving this item
                </MuiAlert>
            </Snackbar>
        </React.Fragment>
    );
}
