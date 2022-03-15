import React from "react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";

import { CustomDialogActions } from "./CustomDialogActions";

export function DeleteConfirmationDialog({
                                             open,
                                             onAccept,
                                             onCancel,
                                             title,
                                             body
                                         }: {
    open: boolean,
    onAccept: () => void,
    onCancel: () => void,
    title?: JSX.Element,
    body?: JSX.Element,
}) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
        >
            <DialogTitle>
                {title ?? "Delete?"}
            </DialogTitle>
            {body && <DialogContent>
                <DialogContentText>
                    {body}
                </DialogContentText>
            </DialogContent>}
            <CustomDialogActions>
                <Button
                    onClick={onCancel}
                    autoFocus>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={onAccept}>
                    Ok
                </Button>
            </CustomDialogActions>
        </Dialog>
    );
}
