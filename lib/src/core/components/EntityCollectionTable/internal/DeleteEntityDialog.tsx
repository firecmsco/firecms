import { Entity, EntityCallbacks, EntityCollection } from "../../../../types";
import React, { useCallback, useMemo, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle
} from "@mui/material";
import { EntityPreview } from "../../index";
import {
    deleteEntityWithCallbacks,
    useDataSource,
    useFireCMSContext,
    useSnackbarController
} from "../../../../hooks";
import { CustomDialogActions } from "../../CustomDialogActions";
import { resolveCollection } from "../../../util/resolutions";

export interface DeleteEntityDialogProps<M extends Record<string, any>> {
    entityOrEntitiesToDelete?: Entity<M> | Entity<M>[],
    path: string,
    collection: EntityCollection<M>
    open: boolean;
    onClose: () => void;
    callbacks?: EntityCallbacks<M>,

    onEntityDelete?(path: string, entity: Entity<M>): void;

    onMultipleEntitiesDelete?(path: string, entities: Entity<M>[]): void;
}

export function DeleteEntityDialog<M extends Record<string, any>>({
                                                                      entityOrEntitiesToDelete,
                                                                      collection,
                                                                      onClose,
                                                                      open,
                                                                      callbacks,
                                                                      onEntityDelete,
                                                                      onMultipleEntitiesDelete,
                                                                      path,
                                                                      ...other
                                                                  }: DeleteEntityDialogProps<M>) {

    const dataSource = useDataSource();
    const snackbarController = useSnackbarController();
    const [loading, setLoading] = useState(false);

    const [entityOrEntities, setUsedEntityOrEntities] = React.useState<Entity<M> | Entity<M>[]>();

    const [multipleEntities, setMultipleEntities] = React.useState<boolean>();
    const context = useFireCMSContext();

    React.useEffect(() => {
        if (entityOrEntitiesToDelete) {
            const revisedEntityOrEntities = Array.isArray(entityOrEntitiesToDelete) && entityOrEntitiesToDelete.length === 1
                ? entityOrEntitiesToDelete[0]
                : entityOrEntitiesToDelete;
            setUsedEntityOrEntities(revisedEntityOrEntities);
            setMultipleEntities(Array.isArray(revisedEntityOrEntities));
        }
    }, [entityOrEntitiesToDelete]);

    const resolvedCollection = useMemo(() => resolveCollection<M>({
        collection,
        path,
        fields: context.fields
    }), [collection, path]);

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    const onDeleteSuccess = useCallback((entity: Entity<any>) => {
        console.debug("Deleted", entity);
    }, []);

    const onDeleteFailure = useCallback((entity: Entity<any>, e: Error) => {
        snackbarController.open({
            type: "error",
            message: "Error deleting: " + e?.message
        });

        console.error("Error deleting entity");
        console.error(e);
    }, [resolvedCollection.name]);

    const onPreDeleteHookError = useCallback((entity: Entity<any>, e: Error) => {
        snackbarController.open({
            type: "error",
            message: "Error before deleting: " + e?.message
        });
        console.error(e);
    }, [resolvedCollection.name]);

    const onDeleteSuccessHookError = useCallback((entity: Entity<any>, e: Error) => {
        snackbarController.open({
            type: "error",
            message: "Error after deleting: " + e?.message
        });
        console.error(e);
    }, [resolvedCollection.name]);

    const performDelete = useCallback((entity: Entity<M>): Promise<boolean> =>
        deleteEntityWithCallbacks({
            dataSource,
            entity,
            collection: resolvedCollection,
            callbacks,
            onDeleteSuccess,
            onDeleteFailure,
            onPreDeleteHookError,
            onDeleteSuccessHookError,
            context
        }), [dataSource, resolvedCollection, callbacks, onDeleteSuccess, onDeleteFailure, onPreDeleteHookError, onDeleteSuccessHookError, context]);

    const handleOk = useCallback(async () => {
        if (entityOrEntities) {

            setLoading(true);

            if (multipleEntities) {
                Promise.all((entityOrEntities as Entity<M>[]).map(performDelete)).then((results) => {

                    setLoading(false);

                    if (onMultipleEntitiesDelete && entityOrEntities)
                        onMultipleEntitiesDelete(path, entityOrEntities as Entity<M>[]);

                    if (results.every(Boolean)) {
                        snackbarController.open({
                            type: "success",
                            message: `${resolvedCollection.name}: multiple deleted`
                        });
                    } else if (results.some(Boolean)) {
                        snackbarController.open({
                            type: "warning",
                            message: `${resolvedCollection.name}: Some of the entities have been deleted, but not all`
                        });
                    } else {
                        snackbarController.open({
                            type: "error",
                            message: `${resolvedCollection.name}: Error deleting entities`
                        });
                    }
                    onClose();
                });

            } else {
                performDelete(entityOrEntities as Entity<M>).then((success) => {
                    setLoading(false);
                    if (success) {
                        if (onEntityDelete && entityOrEntities)
                            onEntityDelete(path, entityOrEntities as Entity<M>);
                        snackbarController.open({
                            type: "success",
                            message: `${resolvedCollection.singularName ?? resolvedCollection.name} deleted`
                        });
                        onClose();
                    }
                });
            }
        }
    }, [entityOrEntities, multipleEntities, performDelete, onMultipleEntitiesDelete, path, onClose, snackbarController, resolvedCollection.name, onEntityDelete]);

    let content: React.ReactNode;
    if (entityOrEntities && multipleEntities) {
        content = <div>Multiple entities</div>;
    } else {
        const entity = entityOrEntities as Entity<M> | undefined;
        content = entity
            ? <EntityPreview
                entity={entity}
                collection={collection}
                path={path}/>
            : <></>;
    }

    const dialogTitle = multipleEntities
        ? `${resolvedCollection.name}: Confirm multiple delete?`
        : `Would you like to delete this ${resolvedCollection.singularName ?? resolvedCollection.name}?`;

    return (
        <Dialog
            maxWidth="md"
            aria-labelledby="delete-dialog"
            open={open}
            onBackdropClick={onClose}
            {...other}
        >
            <DialogTitle id="delete-dialog-title">
                {dialogTitle}
            </DialogTitle>

            {!multipleEntities && <DialogContent dividers>
                {content}
            </DialogContent>}

            <CustomDialogActions>

                {loading && <CircularProgress size={16} thickness={8}/>}

                <Button onClick={handleCancel}
                        disabled={loading}
                        color="primary">
                    Cancel
                </Button>
                <Button
                    autoFocus
                    disabled={loading}
                    onClick={handleOk}
                    variant="contained"
                    color="primary">
                    Ok
                </Button>
            </CustomDialogActions>

        </Dialog>
    );
}
