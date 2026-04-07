import type { EntityCollection } from "@rebasepro/types/cms";
import { Entity, EntityCallbacks } from "@rebasepro/types";
import React, { useCallback, useMemo, useState } from "react";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@rebasepro/ui";
import {
    deleteEntityWithCallbacks,
    useAuthController,
    useCustomizationController,
    useData,
    useRebaseContext,
    useSnackbarController,
    useTranslation
} from "../hooks";
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
    const dataClient = useData();
    const customizationController = useCustomizationController();
    const snackbarController = useSnackbarController();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const context = useRebaseContext();
    const entityOrEntities = Array.isArray(entityOrEntitiesToDelete) && entityOrEntitiesToDelete.length === 1
        ? entityOrEntitiesToDelete[0]
        : entityOrEntitiesToDelete;

    const multipleEntities = Array.isArray(entityOrEntities);

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    const onDeleteSuccess = useCallback((entity: Entity<any>) => {
        console.debug("Deleted", entity);
    }, []);

    const onDeleteFailure = useCallback((entity: Entity<any>, e: Error) => {
        snackbarController.open({
            type: "error",
            title: t("error_deleting"),
            message: e?.message
        });

        console.error("Error deleting entity");
        console.error(e);
    }, [collection.name]);

    const performDelete = useCallback((entity: Entity<M>): Promise<boolean> =>
        deleteEntityWithCallbacks({
            data: dataClient,
            entity,
            collection: collection,
            callbacks,
            onDeleteSuccess,
            onDeleteFailure,
            context
        }), [dataClient, collection, callbacks, onDeleteSuccess, onDeleteFailure, context]);

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
                            message: t("multiple_deleted", { collection: collection.name })
                        });
                    } else if (results.some(Boolean)) {
                        snackbarController.open({
                            type: "warning",
                            message: t("some_entities_deleted", { collection: collection.name })
                        });
                    } else {
                        snackbarController.open({
                            type: "error",
                            message: t("error_deleting_entities", { collection: collection.name })
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
                            message: t("deleted", { name: collection.singularName ?? collection.name })
                        });
                        onClose();
                    }
                });
            }
        }
    }, [entityOrEntities, multipleEntities, performDelete, onMultipleEntitiesDelete, path, onClose, snackbarController, collection.name, onEntityDelete]);

    let content: React.ReactNode;
    if (entityOrEntities && multipleEntities) {
        content = <>{t("multiple_entities")}</>;
    } else {
        const entity = entityOrEntities as Entity<M> | undefined;
        content = entity
            ? <EntityView
                entity={entity}
                collection={collection}
                path={path} />
            : <></>;
    }

    const dialogTitle = multipleEntities
        ? <><b>{collection.name}</b>: {t("confirm_multiple_delete")}</>
        : t("delete_entity_confirm_title", { entityName: collection.singularName ?? collection.name });

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

                {loading && <CircularProgress size={"smallest"} />}

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
