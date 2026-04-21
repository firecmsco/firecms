# ExpandablePanel


`ExpandablePanel` is a versatile component that allows for content to be collapsible, enhancing the organization of UI by hiding content that is not immediately relevant to the user. This component can operate in controlled or uncontrolled mode, with additional features such as an invisible mode for a subtler UI, and an optional field mode to align with form field styling.

## Usage

To use the `ExpandablePanel`, import it from your components and provide the necessary props including `title`, `children`, and control props like `expanded`, `onExpandedChange`, and styling props such as `titleClassName`, `className`.

## Basic Expandable Panel

An example showing the basic usage of the `ExpandablePanel` component.

```tsx
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

```

## Expandable Panel as Field

This variant showcases the `ExpandablePanel` utilized as a field in a form, demonstrating the combination of `asField` property.

```tsx
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

```

## Invisible Expandable Panel

An `ExpandablePanel` example where the panel borders are made invisible for a more seamless integration into the surrounding UI.

```tsx
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

```

