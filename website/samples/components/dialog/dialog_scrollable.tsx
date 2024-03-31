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
                <div className={"p-8 bg-red-500 text-white"} style={{ height: "200vh" }}>Scrollable Dialog Content</div>

                <DialogActions>
                    <Button onClick={() => setOpen(false)}
                            variant={"filled"}>
                        Got it!
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
