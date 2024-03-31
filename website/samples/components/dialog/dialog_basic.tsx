import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, Typography } from "@firecms/ui";

export default function DialogBasicDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Dialog</Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}>
                <DialogContent className="p-8 flex flex-col space-y-2">
                    <Typography variant={"h5"} gutterBottom>
                        Your dialog
                    </Typography>
                    <Typography gutterBottom>
                        Basic Dialog Content
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} variant={"text"}>
                        Close
                    </Button>
                    <Button onClick={() => setOpen(false)}
                            variant={"filled"}>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
