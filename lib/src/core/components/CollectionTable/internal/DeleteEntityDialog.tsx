import { Entity, EntityCallbacks, EntitySchema, } from "../../../../models";
import React, { useCallback, useMemo, useState } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
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
import { useSchemaRegistry } from "../../../../hooks/useSchemaRegistry";
import { CustomDialogActions } from "../../CustomDialogActions";


export interface DeleteEntityDialogProps<M extends { [Key: string]: any }> {
    entityOrEntitiesToDelete?: Entity<M> | Entity<M>[],
    path: string,
    schema: string | EntitySchema<M>
    open: boolean;
    onClose: () => void;
    callbacks?: EntityCallbacks<M>,

    onEntityDelete?(path: string, entity: Entity<M>): void;

    onMultipleEntitiesDelete?(path: string, entities: Entity<M>[]): void;
}

export function DeleteEntityDialog<M extends { [Key: string]: any }>({
                                                                         entityOrEntitiesToDelete,
                                                                         schema: inputSchema,
                                                                         onClose,
                                                                         open,
                                                                         callbacks,
                                                                         onEntityDelete,
                                                                         onMultipleEntitiesDelete,
                                                                         path,
                                                                         ...other
                                                                     }
                                                                         : DeleteEntityDialogProps<M>) {

    const dataSource = useDataSource();
    const schemaRegistry = useSchemaRegistry();
    const snackbarContext = useSnackbarController();
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

    const resolvedSchema = useMemo(() => schemaRegistry.getResolvedSchema<M>({
        schema: inputSchema,
        path
    }), []);

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    const onDeleteSuccess = useCallback((entity: Entity<any>) => {
        console.debug("Deleted", entity);
    }, []);

    const onDeleteFailure = useCallback((entity: Entity<any>, e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${resolvedSchema.name}: Error deleting`,
            message: e?.message
        });

        console.error("Error deleting entity");
        console.error(e);
    }, [resolvedSchema.name]);

    const onPreDeleteHookError = useCallback((entity: Entity<any>, e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${resolvedSchema.name}: Error before deleting`,
            message: e?.message
        });
        console.error(e);
    }, [resolvedSchema.name]);

    const onDeleteSuccessHookError = useCallback((entity: Entity<any>, e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${resolvedSchema.name}: Error after deleting (entity is deleted)`,
            message: e?.message
        });
        console.error(e);
    }, [resolvedSchema.name]);

    const performDelete = useCallback((entity: Entity<M>): Promise<boolean> =>
        deleteEntityWithCallbacks({
            dataSource,
            entity,
            schema: resolvedSchema,
            callbacks,
            onDeleteSuccess,
            onDeleteFailure,
            onPreDeleteHookError,
            onDeleteSuccessHookError,
            context
        }), [dataSource, resolvedSchema, callbacks, onDeleteSuccess, onDeleteFailure, onPreDeleteHookError, onDeleteSuccessHookError, context]);

    const handleOk = useCallback(async () => {
        if (entityOrEntities) {

            setLoading(true);

            if (multipleEntities) {
                Promise.all((entityOrEntities as Entity<M>[]).map(performDelete)).then((results) => {

                    setLoading(false);

                    if (onMultipleEntitiesDelete && entityOrEntities)
                        onMultipleEntitiesDelete(path, entityOrEntities as Entity<M>[]);

                    if (results.every(Boolean)) {
                        snackbarContext.open({
                            type: "success",
                            message: `${resolvedSchema.name}: multiple deleted`
                        });
                    } else if (results.some(Boolean)) {
                        snackbarContext.open({
                            type: "warning",
                            message: `${resolvedSchema.name}: Some of the entities have been deleted, but not all`
                        });
                    } else {
                        snackbarContext.open({
                            type: "error",
                            message: `${resolvedSchema.name}: Error deleting entities`
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
                        snackbarContext.open({
                            type: "success",
                            message: `${resolvedSchema.name} deleted`
                        });
                        onClose();
                    }
                });
            }
        }
    }, [entityOrEntities, multipleEntities, performDelete, onMultipleEntitiesDelete, path, onClose, snackbarContext, resolvedSchema.name, onEntityDelete]);


    let content: JSX.Element;
    if (entityOrEntities && multipleEntities) {
        content = <div>Multiple entities</div>;
    } else {
        const entity = entityOrEntities as Entity<M> | undefined;
        const schema = schemaRegistry.getResolvedSchema({
            schema: inputSchema,
            path,
            entityId: entity?.id,
            values: entity?.values
        });
        content = entity
            ? <EntityPreview
                entity={entity}
                schema={schema}
                path={path}/>
            : <></>;
    }

    const dialogTitle = multipleEntities
        ? `${resolvedSchema.name}: Confirm multiple delete?`
        : `Would you like to delete this ${resolvedSchema.name}?`;

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

