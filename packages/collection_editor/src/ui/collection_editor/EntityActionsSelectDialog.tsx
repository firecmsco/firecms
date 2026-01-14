import { useCustomizationController } from "@firecms/core";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";
import React from "react";

export function EntityActionsSelectDialog({
                                              open,
                                              onClose
                                          }: { open: boolean, onClose: (selectedActionKey?: string) => void }) {
    const {
        entityActions
    } = useCustomizationController();

    return <Dialog
        maxWidth={"md"}
        open={open}>
        <DialogTitle>Select custom action</DialogTitle>
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
                    No custom actions defined. Define your custom actions in the customization settings, before using
                    this
                    dialog.
                </Typography>
            }
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose()}>Cancel</Button>
        </DialogActions>
    </Dialog>
}
