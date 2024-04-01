import React from "react";
import { Popover } from "@firecms/ui";

export default function PopoverStyledDemo() {
    return (
        <Popover
            trigger={<button className="btn">Open Custom Styled Popover</button>}
            className="bg-purple-500 text-white p-3 rounded-lg shadow-lg"
        >
            <div>
                This Popover has custom styles applied.
            </div>
        </Popover>
    );
}