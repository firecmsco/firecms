import React, { useState } from "react";
import { Dialog } from "@firecms/ui";

export default function DialogBasicDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>Open Dialog</button>
            <Dialog 
                open={open} 
                onOpenChange={setOpen}
            >
                Basic Dialog Content
                <button onClick={() => setOpen(false)}>Close</button>
            </Dialog>
        </>
    );
}