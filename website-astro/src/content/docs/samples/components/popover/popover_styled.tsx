import React from "react";
import { Button, Popover } from "@firecms/ui";

export default function PopoverStyledDemo() {
    return (
        <Popover
            trigger={<Button>Open Custom Styled Popover</Button>}
            className="bg-purple-500 text-white p-3 rounded-lg shadow-lg"
        >
            <div>
                This Popover has custom styles applied.
            </div>
        </Popover>
    );
}
