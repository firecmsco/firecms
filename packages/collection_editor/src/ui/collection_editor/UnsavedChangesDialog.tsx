import React from "react";
import { Button, Dialog, DialogActions, DialogContent, Typography } from "@firecms/core";

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
            <DialogContent>
                <Typography variant={"h6"}>
                    {title ?? "Unsaved changes"}
                </Typography>

                {body && <Typography>
                    {body}
                </Typography>}
                <Typography>
                    Are you sure?
                </Typography>

            </DialogContent>

            <DialogActions>
                <Button variant="text" onClick={handleCancel} autoFocus> Cancel </Button>
                <Button onClick={handleOk}> Ok </Button>
            </DialogActions>
        </Dialog>
    );
}
