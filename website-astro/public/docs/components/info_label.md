# InfoLabel


InfoLabel is a versatile component used to display information or warning messages in different contexts. It leverages the flexibility of TailwindCSS for styling, offering predefined color modes for quick customization.

## Usage

To use `InfoLabel`, import it into your component and specify the `children` to display inside it. Optionally, you can also set the `mode` prop to change the appearance based on the context (`info` or `warn`).

## Basic Info Label

A basic example showing how to use the InfoLabel component to display an informational message.

```tsx
import React from "react";
import { InfoLabel } from "@firecms/ui";

export default function InfoLabelBasicDemo() {
    return (
        <InfoLabel mode="info">
            This is an informational message.
        </InfoLabel>
    );
}
```

## Warning Label

Illustrating how to use the InfoLabel component to display a warning message by setting the mode to `warn`.

```tsx
import React from "react";
import { InfoLabel } from "@firecms/ui";

export default function InfoLabelWarnDemo() {
    return (
        <InfoLabel mode="warn">
            Warning: This is a warning message.
        </InfoLabel>
    );
}
```

