import React, { useState } from "react";
import { ExpandablePanel } from "@firecms/ui";

export default function ExpandablePanelFieldDemo() {
    const [expanded, setExpanded] = useState(false);

    return (
        <ExpandablePanel
            title={"Field Expandable Panel"}
            expanded={expanded}
            onExpandedChange={setExpanded}
            asField={true}
        >

            <div className={"p-4"}>
                This Expandable Panel is styled as a field, making it a great choice for forms.
            </div>
        </ExpandablePanel>
);
}
