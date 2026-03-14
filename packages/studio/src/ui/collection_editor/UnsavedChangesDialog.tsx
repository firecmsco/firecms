import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@rebasepro/ui";

export interface UnsavedChangesDialogProps {
    open: boolean;
    body?: React.ReactNode | any;
    title?: string;
    handleOk: () => void;
    handleCancel: () => void;
}

export function UnsavedChangesDialog({
    open,
    handleOk,
    handleCancel,
    body,
    title
}: UnsavedChangesDialogProps) {

    return (
        <Dialog
            open={open}
            onOpenChange={(open: boolean) => open ? handleCancel() : handleOk()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >

            <DialogTitle>{title ?? "Unsaved changes"}</DialogTitle>
            <DialogContent className={"mt-4"}>
                {Boolean(body) && <Typography>
                    {body}
                </Typography>}
                <Typography>
                    Are you sure?
                </Typography>

            </DialogContent>

            <DialogActions>
                <Button variant="text"
                    onClick={handleCancel} autoFocus> Cancel </Button>
                <Button
                    onClick={handleOk}> Ok </Button>
            </DialogActions>
        </Dialog>
    );
}
