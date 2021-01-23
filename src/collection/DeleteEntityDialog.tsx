import { Entity, EntitySchema } from "../models";
import React, { useState } from "react";
import { deleteEntities, deleteEntity } from "../firebase/firestore";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@material-ui/core";
import EntityPreview from "../preview/EntityPreview";
import { CircularProgressCenter } from "../components";
import { useSnackbarContext } from "../contexts";


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

    const snackbarContext = useSnackbarContext();
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

    const handleOk = () => {
        if (entityOrEntities) {

            setLoading(true);

            if (multipleEntities) {
                deleteEntities(entityOrEntities as Entity<S>[]).then(_ => {
                    setLoading(false);
                    if (onMultipleEntitiesDelete && entityOrEntities)
                        onMultipleEntitiesDelete(collectionPath, entityOrEntities as Entity<S>[]);
                    snackbarContext.open({
                        type: "success",
                        message: "Entities deleted"
                    });
                    onClose();
                });
            } else {
                deleteEntity(entityOrEntities as Entity<S>).then(_ => {
                    setLoading(false);
                    if (onEntityDelete && entityOrEntities)
                        onEntityDelete(collectionPath, entityOrEntities as Entity<S>);
                    snackbarContext.open({
                        type: "success",
                        message: "Entity deleted"
                    });
                    onClose();
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
            disableBackdropClick
            disableEscapeKeyDown
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

