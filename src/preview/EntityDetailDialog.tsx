import { Entity, EntitySchema } from "../models";
import React, { useState } from "react";
import { deleteEntity } from "../firebase/firestore";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import { DialogContent, Snackbar } from "@material-ui/core";
import EntityPreview from "../preview/EntityPreview";
import { CircularProgressCenter } from "../util";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import MuiAlert from "@material-ui/lab/Alert/Alert";

export interface EntityDetailDialogProps<S extends EntitySchema> {
    entity?: Entity<S>,
    schema: S
    open: boolean;
    onClose: () => void;
}

export default function EntityDetailDialog<S extends EntitySchema>(props: EntityDetailDialogProps<S>) {
    const { entity, schema, onClose, open, ...other } = props;

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
                    {entity && <EntityPreview entity={entity} schema={schema}/>}
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

