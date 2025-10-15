import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";

export interface UnsavedChangesDialogProps {
    open: boolean;
    body?: React.ReactNode;
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
            onOpenChange={(open) => open ? handleCancel() : handleOk()}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >

            <DialogTitle>{title ?? "Unsaved changes"}</DialogTitle>
            <DialogContent>
                {body && <Typography>
                    {body}
                </Typography>}
                <Typography>
                    Are you sure?
                </Typography>

            </DialogContent>

            <DialogActions>
                <Button variant="text"
                        color={"primary"}
                        onClick={handleCancel} autoFocus> Cancel </Button>
                <Button
                    color={"primary"}
                    onClick={handleOk}> Ok </Button>
            </DialogActions>
        </Dialog>
    );
}
