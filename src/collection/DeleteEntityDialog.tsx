import { Entity, EntitySchema } from "../models";
import React, { useState } from "react";
import { deleteEntity } from "../models/firestore";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@material-ui/core";
import EntityPreview from "../preview/EntityPreview";
import { CircularProgressCenter } from "../components";
import { useSnackbarController } from "../contexts";


export interface DeleteEntityDialogProps<S extends EntitySchema> {
    entityOrEntitiesToDelete?: Entity<S> | Entity<S>[],
    collectionPath: string,
    schema: S
    open: boolean;

    onEntityDelete?(collectionPath: string, entity: Entity<S>): void;

    onMultipleEntitiesDelete?(collectionPath: string, entities: Entity<S>[]): void;

    onClose: () => void;
}

export default function DeleteEntityDialog<S extends EntitySchema>({
                                                                       entityOrEntitiesToDelete,
                                                                       schema,
                                                                       onClose,
                                                                       open,
                                                                       onEntityDelete,
                                                                       onMultipleEntitiesDelete,
                                                                       collectionPath,
                                                                       ...other
                                                                   }
                                                                       : DeleteEntityDialogProps<S>) {

    const snackbarContext = useSnackbarController();
    const [loading, setLoading] = useState(false);

    const entityOrEntitiesRef = React.useRef<Entity<S> | Entity<S>[]>();
    const [multipleEntities, setMultipleEntities] = React.useState<boolean>();

    React.useEffect(() => {
        if (entityOrEntitiesToDelete) {
            entityOrEntitiesRef.current = Array.isArray(entityOrEntitiesToDelete) && entityOrEntitiesToDelete.length === 1
                ? entityOrEntitiesToDelete[0]
                : entityOrEntitiesToDelete;
            setMultipleEntities(Array.isArray(entityOrEntitiesRef.current));
        }
    }, [entityOrEntitiesToDelete]);

    const entityOrEntities = entityOrEntitiesRef.current;

    const handleCancel = () => {
        onClose();
    };

    const onDeleteSuccess = (entity: Entity<any>) => {
        console.log(entity);
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

    function performDelete(entity: Entity<S>): Promise<boolean> {
        return deleteEntity({
            entity,
            schema,
            collectionPath,
            onDeleteSuccess,
            onDeleteFailure,
            onPreDeleteHookError,
            onDeleteSuccessHookError
        });
    }

    const handleOk = async () => {
        if (entityOrEntities) {

            setLoading(true);

            if (multipleEntities) {
                Promise.all((entityOrEntities as Entity<S>[]).map(performDelete)).then((results) => {

                    setLoading(false);

                    if (onMultipleEntitiesDelete && entityOrEntities)
                        onMultipleEntitiesDelete(collectionPath, entityOrEntities as Entity<S>[]);

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
                performDelete(entityOrEntities as Entity<S>).then((success) => {
                    setLoading(false);
                    if (success) {
                        if (onEntityDelete && entityOrEntities)
                            onEntityDelete(collectionPath, entityOrEntities as Entity<S>);
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
        <EntityPreview entity={entityOrEntities as Entity<S>}
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

