import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@firecms/ui";

export default function DialogCustomWidthDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Custom Width Dialog</Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}
                maxWidth="5xl"
            >
                <DialogTitle variant={"h5"} gutterBottom>
                    Your dialog
                </DialogTitle>
                <DialogContent>
                    Dialog with Custom Width
                </DialogContent>
                <DialogActions>
                    <Button
                        color={"primary"}
                        onClick={() => setOpen(false)}
                        variant={"filled"}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
