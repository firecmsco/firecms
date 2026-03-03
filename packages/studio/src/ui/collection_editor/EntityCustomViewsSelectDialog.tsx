import { useCustomizationController } from "@firecms/core";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";
import React from "react";

export function EntityCustomViewsSelectDialog({
                                                  open,
                                                  onClose
                                              }: { open: boolean, onClose: (selectedViewKey?: string) => void }) {
    const {
        entityViews,
    } = useCustomizationController();

    return <Dialog
        maxWidth={"md"}
        open={open}>
        <DialogTitle>Select custom view</DialogTitle>
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
                    No custom views defined. Define your custom views in the customization settings, before using this
                    dialog.
                </Typography>
            }
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose()}>Cancel</Button>
        </DialogActions>
    </Dialog>
}
