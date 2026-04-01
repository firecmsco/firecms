import React, { useState } from "react";
import { ExpandablePanel } from "@firecms/ui";

export default function ExpandablePanelBasicDemo() {
    const [expanded, setExpanded] = useState(false);

    return (
        <ExpandablePanel
            title={"Click to expand"}
            expanded={expanded}
            onExpandedChange={setExpanded}
        >
            <div className={"p-4"}>
                Here is some content that was hidden but now is visible!
            </div>
        </ExpandablePanel>
    );
}
