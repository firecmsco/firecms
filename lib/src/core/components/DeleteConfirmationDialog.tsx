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
                                             Title,
                                             loading,
                                             Body
                                         }: {
    open: boolean,
    onAccept: () => void,
    onCancel: () => void,
    loading?: boolean,
    Title: JSX.Element,
    Body?: JSX.Element,
}) {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
        >
            <DialogTitle>
                {Title}
            </DialogTitle>
            {Body && <DialogContent>
                <DialogContentText>
                    {Body}
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
                >
                    Ok
                </LoadingButton>
            </CustomDialogActions>
        </Dialog>
    );
}
