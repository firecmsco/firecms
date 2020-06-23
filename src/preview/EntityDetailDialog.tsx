import { Entity, EntitySchema } from "../models";
import React, { useEffect, useState } from "react";
import { listenEntityFromRef } from "../firebase/firestore";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DialogContent } from "@material-ui/core";
import EntityPreview from "../preview/EntityPreview";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

export interface EntityDetailDialogProps<S extends EntitySchema> {
    entity: Entity<S>,
    schema: S
    open: boolean;
    onClose: () => void;
}

export default function EntityDetailDialog<S extends EntitySchema>(props: EntityDetailDialogProps<S>) {

    const { entity, schema, onClose, open, ...other } = props;

    const [updatedEntity, setUpdatedEntity] = useState<Entity<S>>(entity);

    useEffect(() => {
        const cancelSubscription = listenEntityFromRef<S>(
            entity?.reference,
            schema,
            (e) => {
                if (e) {
                    setUpdatedEntity(e);
                    console.log("Updated entity from Firestore", e);
                }
            });
        return () => cancelSubscription();
    }, [entity]);

    return (
        <React.Fragment>

            <Dialog
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="md"
                keepMounted
                aria-labelledby="confirmation-dialog-title"
                onBackdropClick={onClose}
                open={open}
                {...other}
            >
                <DialogTitle id="confirmation-dialog-title">
                    {schema.name}
                </DialogTitle>

                <DialogContent dividers>
                    {updatedEntity && <EntityPreview entity={updatedEntity} schema={schema}/>}
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} color="primary">
                        Ok
                    </Button>
                </DialogActions>

            </Dialog>

        </React.Fragment>
    );
}

