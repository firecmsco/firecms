import React, { useState } from "react";
import { ExpandablePanel } from "@firecms/ui";

export default function ExpandablePanelInvisibleDemo() {
    const [expanded, setExpanded] = useState(false);

    return (
        <ExpandablePanel
            title={"Invisible Expandable Panel"}
            expanded={expanded}
            onExpandedChange={setExpanded}
            invisible={true}
        >
            <div className={"p-4"}>
                This content is hidden inside an invisible panel, making the UI cleaner.
            </div>
        </ExpandablePanel>
    );
}
