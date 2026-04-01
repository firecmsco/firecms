import React, { useState } from "react";
import { Sheet } from "@firecms/ui";

export default function SheetTransparentDemo() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setOpen(true)}>Open Transparent Sheet</button>
            <Sheet open={open} onOpenChange={setOpen} transparent>
                <div style={{ padding: "1rem" }}>Transparent Sheet Content</div>
            </Sheet>
        </div>
    );
}