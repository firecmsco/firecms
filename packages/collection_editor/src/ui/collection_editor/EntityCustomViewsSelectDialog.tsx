import { Button, Dialog, DialogActions, DialogContent, Typography, useFireCMSContext } from "@firecms/core";
import React from "react";

export function EntityCustomViewsSelectDialog({ open, onClose }: { open: boolean, onClose: (selectedViewKey?: string) => void }) {
    const {
        entityViews,
    } = useFireCMSContext();

    return <Dialog
        maxWidth={"md"}
        open={open}>
        <DialogContent>
            <Typography variant={"h6"}>
                Select view
            </Typography>
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
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose()}>Cancel</Button>
        </DialogActions>
    </Dialog>
}
