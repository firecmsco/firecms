# Paper


The `Paper` component is a simple and versatile component used to display content within a flat or elevated surface. This makes it useful as a building block for various UI sections such as cards, dialogues, or panels.

## Usage

To use the `Paper` component, import it from your components. You can pass children, an optional `style`, and an optional `className` prop for additional styling.

## Basic Paper

Simple example of using the `Paper` component to create a basic surface for content.

```tsx
import React from "react";
import { Paper } from "@firecms/ui";

export default function PaperBasicDemo() {
    return (
        <Paper>
            This is a basic paper component.
        </Paper>
    );
}
```

## Customized Paper

Illustrates how to customize the `Paper` component by passing `style` and `className` props.

```tsx
import React from "react";
import { Paper } from "@firecms/ui";

export default function PaperCustomizedDemo() {
    const customStyle = {
        padding: "20px",
        backgroundColor: "#f5f5f5",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,.1)"
    };

    return (
        <Paper style={customStyle} className="my-custom-paper">
            This is a customized paper component.
        </Paper>
    );
}
```

