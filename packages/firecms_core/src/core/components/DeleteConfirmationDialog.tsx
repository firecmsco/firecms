import React from "react";

import { Button, Dialog, DialogActions, DialogContent, LoadingButton, Typography } from "../../components";

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
    loading?: boolean,
    title: React.ReactNode,
    body?: React.ReactNode,
}) {
    return (
        <Dialog
            open={open}
            onOpenChange={(open) => !open ? onCancel() : undefined}
        >
            <DialogContent>
                <Typography variant={"h6"} className={"mb-2"}>{title}</Typography>
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
