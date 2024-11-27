import React from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LoadingButton, Typography } from "@firecms/ui";

export function ConfirmationDialog({
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
    loading?: boolean,
    title: React.ReactNode,
    body?: React.ReactNode,
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(open) => !open ? onCancel() : undefined}
        >
            <DialogTitle variant={"h6"} className={"mb-2"}>{title}</DialogTitle>
            <DialogContent>
                {body}
            </DialogContent>

            <DialogActions>
                <Button
                    variant={"text"}
                    onClick={onCancel}
                    autoFocus>Cancel</Button>

                <LoadingButton
                    color="primary"
                    type="submit"
                    loading={loading}
                    onClick={onAccept}
                >
                    Ok
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
