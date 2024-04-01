import React from "react";
import { Popover } from "@firecms/ui";

export default function PopoverAlignDemo() {
    return (
        <div>
            <Popover
                trigger={<button className="btn">Open Left</button>}
                side="left"
            >
                <div className="p-4">
                    Aligned to the left.
                </div>
            </Popover>
            <Popover
                trigger={<button className="btn ml-2">Open Bottom</button>}
                side="bottom"
            >
                <div className="p-4">
                    Aligned to the bottom.
                </div>
            </Popover>
        </div>
    );
}