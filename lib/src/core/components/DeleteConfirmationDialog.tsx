import React from "react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";

import { CustomDialogActions } from "./CustomDialogActions";
import { LoadingButton } from "@mui/lab";

export function DeleteConfirmationDialog({
                                             open,
                                             onAccept,
                                             onCancel,
                                             title,
                                             loading,
                                             body
                                         }: {
    open: boolean,
    onAccept: () => void,
    onCancel: () => void,
    loading?:boolean,
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

                <LoadingButton
                    variant="contained"
                    color="primary"
                    type="submit"
                    loading={loading}
                    onClick={onAccept}
                    loadingPosition="start"
                >
                    Ok
                </LoadingButton>
            </CustomDialogActions>
        </Dialog>
    );
}
