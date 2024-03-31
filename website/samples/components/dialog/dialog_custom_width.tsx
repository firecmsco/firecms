import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent } from "@firecms/ui";

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
                <DialogContent className="p-8">
                    Dialog with Custom Width
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}
                            variant={"filled"}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
