import React, { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, Typography } from "@firecms/ui";

export default function DialogFullScreenDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Full-Screen Dialog</Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}
                fullScreen={true}
            >
                <DialogContent className="p-8 flex flex-col space-y-2">
                    <Typography variant={"h5"} gutterBottom>
                        Your dialog
                    </Typography>
                    <Typography gutterBottom>
                        Full-Screen Dialog Content
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}
                            variant={"filled"}>
                        Done
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
