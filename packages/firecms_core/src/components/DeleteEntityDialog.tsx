import { Entity, EntityCallbacks, EntityCollection } from "../types";
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
import { useTranslation } from "../hooks/useTranslation";

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
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);

    const context = useFireCMSContext();
    const entityOrEntities = Array.isArray(entityOrEntitiesToDelete) && entityOrEntitiesToDelete.length === 1
        ? entityOrEntitiesToDelete[0]
        : entityOrEntitiesToDelete;

    const multipleEntities = Array.isArray(entityOrEntities);

    const resolvedCollection = useMemo(() => resolveCollection<M>({
        collection,
        path,
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
            message: t("error_deleting", { message: e?.message })
        });

        console.error("Error deleting entity");
        console.error(e);
    }, [resolvedCollection.name]);

    const onPreDeleteHookError = useCallback((entity: Entity<any>, e: Error) => {
        snackbarController.open({
            type: "error",
            message: t("error_before_delete", { message: e?.message })
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
        content = <>{t("multiple_entities")}</>;
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
        ? <><b>{resolvedCollection.name}</b>: {t("confirm_multiple_delete")}</>
        : t("delete_entity_confirm_title", { entityName: resolvedCollection.singularName ?? resolvedCollection.name });

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
                        variant="text">
                    {t("cancel")}
                </Button>
                <Button
                    autoFocus
                    disabled={loading}
                    onClick={handleOk}
                    variant="filled">
                    {t("ok")}
                </Button>
            </DialogActions>

        </Dialog>
    );
}
