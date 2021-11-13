import { Entity, EntityCallbacks, EntitySchema } from "../../../../models";
import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@mui/material";
import { CircularProgressCenter, EntityPreview } from "../../index";
import {
    deleteEntityWithCallbacks,
    useDataSource,
    useFireCMSContext,
    useSnackbarController
} from "../../../../hooks";


export interface DeleteEntityDialogProps<M extends { [Key: string]: any }, UserType> {
    entityOrEntitiesToDelete?: Entity<M> | Entity<M>[],
    path: string,
    schema: EntitySchema<M>,
    open: boolean;
    onClose: () => void;
    callbacks?: EntityCallbacks<M>,

    onEntityDelete?(path: string, entity: Entity<M>): void;

    onMultipleEntitiesDelete?(path: string, entities: Entity<M>[]): void;
}

export function DeleteEntityDialog<M extends { [Key: string]: any }, UserType>({
                                                                         entityOrEntitiesToDelete,
                                                                         schema,
                                                                         onClose,
                                                                         open,
                                                                         callbacks,
                                                                         onEntityDelete,
                                                                         onMultipleEntitiesDelete,
                                                                         path,
                                                                         ...other
                                                                     }
                                                                         : DeleteEntityDialogProps<M, UserType>) {

    const dataSource = useDataSource();
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

    const handleCancel = () => {
        onClose();
    };

    const onDeleteSuccess = (entity: Entity<any>) => {
        console.debug("Deleted", entity);
    };

    const onDeleteFailure = (entity: Entity<any>, e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${schema.name}: Error deleting`,
            message: e?.message
        });

        console.error("Error deleting entity");
        console.error(e);
    };

    const onPreDeleteHookError = (entity: Entity<any>, e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${schema.name}: Error before deleting`,
            message: e?.message
        });
        console.error(e);
    };

    const onDeleteSuccessHookError = (entity: Entity<any>, e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${schema.name}: Error after deleting (entity is deleted)`,
            message: e?.message
        });
        console.error(e);
    };

    function performDelete(entity: Entity<M>): Promise<boolean> {
        return deleteEntityWithCallbacks({
            dataSource,
            entity,
            schema,
            callbacks,
            onDeleteSuccess,
            onDeleteFailure,
            onPreDeleteHookError,
            onDeleteSuccessHookError,
            context
        });
    }

    const handleOk = async () => {
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
                            message: `${schema.name}: multiple deleted`
                        });
                    } else if (results.some(Boolean)) {
                        snackbarContext.open({
                            type: "warning",
                            message: `${schema.name}: Some of the entities have been deleted, but not all`
                        });
                    } else {
                        snackbarContext.open({
                            type: "error",
                            message: `${schema.name}: Error deleting entities`
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
                            message: `${schema.name} deleted`
                        });
                        onClose();
                    }
                });
            }
        }
    };

    const content = entityOrEntities && (multipleEntities ?
        <div>Multiple entities</div> :
        <EntityPreview entity={entityOrEntities as Entity<M>}
                       schema={schema}/>);

    const dialogTitle = multipleEntities ? `${schema.name}: Confirm multiple delete?`
        : `Would you like to delete this ${schema.name}?`;

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

            {loading && <CircularProgressCenter/>}

            {!loading &&
            <DialogActions>
                <Button autoFocus onClick={handleCancel}
                        color="primary">
                    Cancel
                </Button>
                <Button onClick={handleOk} color="primary">
                    Ok
                </Button>
            </DialogActions>}

        </Dialog>
    );
}

