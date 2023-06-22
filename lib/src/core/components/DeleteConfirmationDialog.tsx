import React from "react";

import { DialogActions } from "./DialogActions";
import { LoadingButton } from "@mui/lab";
import { Dialog } from "../../components/Dialog";
import { Button } from "../../components/Button";

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
                    variant="contained"
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
