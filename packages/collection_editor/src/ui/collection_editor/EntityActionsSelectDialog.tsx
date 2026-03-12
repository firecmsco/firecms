import { useCustomizationController, useTranslation } from "@firecms/core";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";
import React from "react";

export function EntityActionsSelectDialog({
                                              open,
                                              onClose
                                          }: { open: boolean, onClose: (selectedActionKey?: string) => void }) {
    const {
        entityActions
    } = useCustomizationController();
    const { t } = useTranslation();

    return <Dialog
        maxWidth={"md"}
        open={open}>
        <DialogTitle>{t("select_custom_action")}</DialogTitle>
        <DialogContent className={"flex flex-col gap-4"}>
            {entityActions?.map((action) => {
                return <Button
                    key={action.key}
                    onClick={() => onClose(action.key)}
                    fullWidth
                    variant={"text"}
                >
                    {action.name} ({action.key})
                </Button>;
            })}
            {(entityActions ?? []).length === 0 &&
                <Typography variant={"body2"}>
                    {t("no_custom_actions_defined")}
                </Typography>
            }
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose()}>{t("cancel")}</Button>
        </DialogActions>
    </Dialog>
}
