import React from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, LoadingButton } from "@firecms/ui";
import { useTranslation } from "../hooks/useTranslation";

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
    const { t } = useTranslation();
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
                    autoFocus>{t("cancel")}</Button>

                <LoadingButton
                    type="submit"
                    loading={loading}
                    onClick={onAccept}
                    autoFocus>
                    {t("ok")}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
}
