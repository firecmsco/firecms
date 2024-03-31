import React, { useState } from "react";
import { Dialog } from "@firecms/ui";

export default function DialogScrollableDemo() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button onClick={() => setOpen(true)}>Open Scrollable Dialog</button>
            <Dialog 
                open={open} 
                onOpenChange={setOpen}
                scrollable={true}
            >
                <div style={{height: '200vh'}}>Scrollable Dialog Content</div>
                <button onClick={() => setOpen(false)}>Close</button>
            </Dialog>
        </>
    );
}