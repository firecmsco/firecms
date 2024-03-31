import React, { useState } from "react";
import { Dialog } from "@firecms/ui";

export default function DialogFullScreenDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>Open Full-Screen Dialog</button>
            <Dialog 
                open={open} 
                onOpenChange={setOpen}
                fullScreen={true}
            >
                Full-Screen Dialog Content
                <button onClick={() => setOpen(false)}>Close</button>
            </Dialog>
        </>
    );
}