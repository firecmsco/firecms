import { useFireCMSContext } from "@firecms/core";
import { Button, Dialog, DialogActions, DialogContent, Typography } from "@firecms/ui";
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
            {(entityViews ?? []).length === 0 &&
                <Typography variant={"body2"}>
                    No custom views defined
                </Typography>
            }
        </DialogContent>
        <DialogActions>
            <Button onClick={() => onClose()}>Cancel</Button>
        </DialogActions>
    </Dialog>
}
