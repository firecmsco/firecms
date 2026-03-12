import React, { useState } from "react";
import { Button, Popover } from "@firecms/ui";

export default function PopoverControlledDemo() {
    const [open, setOpen] = useState(false);

    return (
        <Popover
            trigger={<Button onClick={() => setOpen(!open)}>Toggle Popover</Button>}
            open={open}
            onOpenChange={setOpen}
        >
            <div className="p-4">
                This Popover's visibility is controlled externally.
            </div>
        </Popover>
    );
}
