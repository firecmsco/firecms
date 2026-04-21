# Separator

Separators are used to visually distinguish content in a layout or list. They can be either horizontal or vertical, making them versatile for various design needs.

## Usage

To use the `Separator`, import it from your components and specify the `orientation` and optionally, the `decorative` prop to control its appearance.

## Horizontal Separator

A separator that spans horizontally, useful for dividing content like list items or sections in a layout.

```tsx
import React from "react";
import { Separator } from "@firecms/ui";

export default function SeparatorHorizontalDemo() {
    return <Separator orientation="horizontal" />;
}
```

## Decorative Separator

Demonstrates how to use the `decorative` prop to render a separator that is meant for visual or decorative purposes rather than semantic division of content.

```tsx
import React from "react";
import { Separator } from "@firecms/ui";

export default function SeparatorDecorativeDemo() {
    return <Separator orientation="horizontal" decorative={true} />;
}
```

