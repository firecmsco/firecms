import React from "react";

import { DialogActions } from "./DialogActions";
import { Dialog, Button } from "../../components";
import { LoadingButton } from "../../components/LoadingButton";

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
            {title}
            {body}

            <DialogActions>
                <Button
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
