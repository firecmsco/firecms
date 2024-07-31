import React from "react";
import { Button, Popover } from "@firecms/ui";

export default function PopoverBasicDemo() {
    return (
        <Popover
            trigger={<Button>Open Popover</Button>}
        >
            <div className="p-4">
                This is a basic Popover.
            </div>
        </Popover>
    );
}
