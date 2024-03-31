import React, { useState } from "react";
import { Dialog } from "@firecms/ui";

export default function DialogCustomWidthDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>Open Custom Width Dialog</button>
            <Dialog 
                open={open} 
                onOpenChange={setOpen}
                maxWidth="md"
            >
                Dialog with Custom Width
                <button onClick={() => setOpen(false)}>Close</button>
            </Dialog>
        </>
    );
}