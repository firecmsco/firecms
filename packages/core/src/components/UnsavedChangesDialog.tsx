import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@rebasepro/ui";
import { useTranslation } from "../hooks";

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

    const { t } = useTranslation();

    return (
        <Dialog
            onEscapeKeyDown={() => {
                handleCancel();
            }}
            open={open}
        >
            <DialogTitle variant={"h6"}>{title}</DialogTitle>
            <DialogContent>

                {body}

                <Typography>
                    {t("unsaved_changes")}
                </Typography>

            </DialogContent>
            <DialogActions>
                <Button variant="text"
                    onClick={handleCancel} autoFocus> {t("cancel")} </Button>
                <Button
                    onClick={handleOk}> {t("ok")} </Button>
            </DialogActions>
        </Dialog>
    );
}
