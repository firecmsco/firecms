import React, { useState } from "react";
import { Popover } from "@firecms/ui";

export default function PopoverControlledDemo() {
    const [open, setOpen] = useState(false);
    
    return (
        <Popover
            trigger={<button className="btn" onClick={() => setOpen(!open)}>Toggle Popover</button>}
            open={open}
            onOpenChange={setOpen}
        >
            <div className="p-4">
                This Popover's visibility is controlled externally.
            </div>
        </Popover>
    );
}