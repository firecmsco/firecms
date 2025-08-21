import { Entity, EntityCallbacks, EntityCollection } from "@firecms/types";
import React, { useCallback, useMemo, useState } from "react";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@firecms/ui";
import {
    deleteEntityWithCallbacks,
    useAuthController,
    useCustomizationController,
    useDataSource,
    useFireCMSContext,
    useSnackbarController
} from "../hooks";
import { resolveCollection } from "../util";
import { EntityView } from "./EntityView";

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
                                                                      path
                                                                  }: DeleteEntityDialogProps<M>) {
    const authController = useAuthController();
    const dataSource = useDataSource(collection);
    const customizationController = useCustomizationController();
    const snackbarController = useSnackbarController();
    const [loading, setLoading] = useState(false);

    const context = useFireCMSContext();
    const entityOrEntities = Array.isArray(entityOrEntitiesToDelete) && entityOrEntitiesToDelete.length === 1
        ? entityOrEntitiesToDelete[0]
        : entityOrEntitiesToDelete;

    const multipleEntities = Array.isArray(entityOrEntities);

    const resolvedCollection = useMemo(() => resolveCollection<M>({
        collection,
        path: path,
        propertyConfigs: customizationController.propertyConfigs,
        authController
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
            title: "Error deleting",
            message: e?.message
        });

        console.error("Error deleting entity");
        console.error(e);
    }, [resolvedCollection.name]);

    const onPreDeleteHookError = useCallback((entity: Entity<any>, e: Error) => {
        snackbarController.open({
            type: "error",
            title: "Error before deleting",
            message: e?.message
        });
        console.error(e);
    }, [resolvedCollection.name]);

    const onDeleteSuccessHookError = useCallback((entity: Entity<any>, e: Error) => {
        snackbarController.open({
            type: "error",
            title: "Error after deleting",
            message: e?.message
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
        content = <>Multiple entities</>;
    } else {
        const entity = entityOrEntities as Entity<M> | undefined;
        content = entity
            ? <EntityView
                entity={entity}
                collection={collection}
                path={path}/>
            : <></>;
    }

    const dialogTitle = multipleEntities
        ? <><b>{resolvedCollection.name}</b>: Confirm multiple delete?</>
        : `Would you like to delete this ${resolvedCollection.singularName ?? resolvedCollection.name}?`;

    return (
        <Dialog
            maxWidth={multipleEntities ? "lg" : "2xl"}
            aria-labelledby="delete-dialog"
            open={open}
            onOpenChange={(open) => !open ? onClose() : undefined}
        >
            <DialogTitle id="delete-dialog-title">
                {dialogTitle}
            </DialogTitle>
            <DialogContent fullHeight={true}>
                {!multipleEntities && <div className={"p-4"}>{content}</div>}
            </DialogContent>
            <DialogActions>

                {loading && <CircularProgress size={"smallest"}/>}

                <Button onClick={handleCancel}
                        disabled={loading}
                        variant="text"
                        color="primary">
                    Cancel
                </Button>
                <Button
                    autoFocus
                    disabled={loading}
                    onClick={handleOk}
                    variant="filled"
                    color="primary">
                    Ok
                </Button>
            </DialogActions>

        </Dialog>
    );
}
