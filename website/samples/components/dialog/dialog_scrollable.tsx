import React, { useState } from "react";
import { Button, Dialog, DialogActions } from "@firecms/ui";

export default function DialogScrollableDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open Scrollable Dialog</Button>
            <Dialog
                open={open}
                onOpenChange={setOpen}
                scrollable={true}
            >
                <div className={"p-8 bg-red-100 text-red-800"} style={{ height: "200vh" }}>Scrollable Dialog Content
                </div>

                <DialogActions>
                    <Button
                        color={"primary"}
                        onClick={() => setOpen(false)}
                        variant={"filled"}>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
