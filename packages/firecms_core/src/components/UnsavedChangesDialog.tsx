import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";
import { useTranslation } from "../hooks/useTranslation";

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
                    {t("are_you_sure_leave")}
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
