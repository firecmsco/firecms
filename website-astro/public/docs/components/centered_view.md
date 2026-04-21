# CenteredView


CenteredView is a layout utility component that centers its children within the parent container. It's ideal for creating centered layouts with an optional maximum width.

## Usage

Import the `CenteredView` from `@firecms/ui` and wrap the content you wish to be centered. Optionally, specify a maximum width for the centered content or make it full screen.

## Basic Centered View

Demonstrates a centered view with default settings.

```tsx
import React from "react";
import { CenteredView } from "@firecms/ui";

export default function CenteredViewBasicDemo() {
    return (
        <CenteredView>
            Basic centered view content.
        </CenteredView>
    );
}

```

## Max Width Centered View

Shows a centered view with a maximum width set.

```tsx
import React from "react";
import { CenteredView } from "@firecms/ui";

export default function CenteredViewMaxWidthDemo() {
    return (
        <CenteredView maxWidth="sm">
            Centered view content with a maximum width set.
        </CenteredView>
    );
}

```

## Custom Styling Centered View

Illustrates how custom styles and classes can be applied to the centered view for a unique appearance.

```tsx
import React from "react";
import { CenteredView } from "@firecms/ui";

export default function CenteredViewCustomStyleDemo() {
    return (
        <CenteredView className="bg-red-200 dark:bg-red-900">
            Centered view content with custom styling.
        </CenteredView>
    );
}

```

