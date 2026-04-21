# IconButton


IconButtons are versatile clickable elements that can be used in various parts of the interface. They support multiple sizes, shapes, and can be either filled or presented as ghost buttons.

## Usage

To use the `IconButton`, import it from your components and pass the required props such as `size`, `variant`, `shape`, `disabled`, `toggled`, and `onClick`.

## Basic IconButton

A simple icon button with minimal configuration.

```tsx
import React from "react";
import { AddIcon, IconButton } from "@firecms/ui";

export default function IconButtonBasicDemo() {
    return (
        <IconButton
            variant="filled"
            onClick={() => console.log("Clicked!")}>
            <AddIcon/>
        </IconButton>
    );
}

```

## IconButton Sizes

Demonstrates how to use different sizes for the IconButton component.

```tsx
import React from "react";
import { AddIcon, IconButton } from "@firecms/ui";

export default function IconButtonSizeDemo() {
    return (
        <>
            <IconButton
                variant="filled"
                size="small"
                onClick={() => console.log("Small Clicked!")}>
                <AddIcon size={"small"}/>
            </IconButton>
            <IconButton
                variant="filled"
                size="medium"
                onClick={() => console.log("Medium Clicked!")}>
                <AddIcon/>
            </IconButton>
            <IconButton
                variant="filled"
                size="large"
                onClick={() => console.log("Large Clicked!")}>
                <AddIcon size={"large"}/>
            </IconButton>
        </>
    );
}

```

## IconButton Shapes

Illustrating how to use different shapes (circular or square) for the IconButton component.

```tsx
import React from "react";
import { AddIcon, IconButton } from "@firecms/ui";

export default function IconButtonShapeDemo() {
    return (
        <>
            <IconButton
                variant="filled"
                shape="circular"
                onClick={() => console.log("Circular Clicked!")}>
                <AddIcon/>
            </IconButton>
            <IconButton
                variant="filled"
                shape="square"
                onClick={() => console.log("Square Clicked!")}>
                <AddIcon/>
            </IconButton>
        </>
    );
}

```

## IconButton Variants

Showing the different variants (ghost or filled) available for styling the IconButton.

```tsx
import React from "react";
import { AddIcon, IconButton } from "@firecms/ui";

export default function IconButtonVariantDemo() {
    return (
        <>
            <IconButton variant="ghost" onClick={() => console.log('Ghost Clicked!')}>
                <AddIcon />
            </IconButton>
            <IconButton variant="filled" onClick={() => console.log('Filled Clicked!')}>
                <AddIcon />
            </IconButton>
        </>
    );
}

```

