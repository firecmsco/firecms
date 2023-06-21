import React from "react";
import { Button } from "@mui/material";

import { CustomDialogActions } from "./CustomDialogActions";
import { LoadingButton } from "@mui/lab";
import { Dialog } from "../../components/Dialog";

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
            <div>
                {title}
                {body}
            </div>

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
