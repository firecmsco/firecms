import React, { useState } from "react";
import { Button, CenteredView, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";

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
                <DialogContent
                    includeMargin={false}>
                    <CenteredView>
                        <DialogTitle variant={"h3"} includeMargin={false}>
                            Your dialog
                        </DialogTitle>
                        <Typography gutterBottom>
                            Full-Screen Dialog Content
                        </Typography>
                        <Button variant={"outlined"}>
                            Click me
                        </Button>
                    </CenteredView>
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
