import { useCustomizationController, useTranslation } from "@firecms/core";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";
import React from "react";

export function EntityCustomViewsSelectDialog({
                                                  open,
                                                  onClose
                                              }: { open: boolean, onClose: (selectedViewKey?: string) => void }) {
    const {
        entityViews,
    } = useCustomizationController();
    const { t } = useTranslation();

    return <Dialog
        maxWidth={"md"}
        open={open}>
        <DialogTitle>{t("select_custom_view")}</DialogTitle>
        <DialogContent className={"flex flex-col gap-4"}>
            {entityViews?.map((view) => {
                return <Button
                    key={view.key}
                    onClick={() => onClose(view.key)}
                    fullWidth
                    variant={"text"}
                >
                    {view.name} ({view.key})
                </Button>;
            })}
            {(entityViews ?? []).length === 0 &&
                <Typography variant={"body2"}>
                    {t("no_custom_views_defined")}
                </Typography>
            }
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose()}>{t("cancel")}</Button>
        </DialogActions>
    </Dialog>
}
