# Sheet

The `Sheet` component is used to display sliding panels from the edges of the screen. It can be opened from the top, bottom, left, or right, and may be either opaque or transparent.

## Usage

To use the `Sheet`, import it from your components and pass the `open`, `side`, `transparent`, and `onOpenChange` props.

## Basic Sheet

A simple sheet that slides in from the right.

```tsx
import React, { useState } from "react";
import { Button, Sheet } from "@firecms/ui";

export default function SheetBasicDemo() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <Button onClick={() => setOpen(true)}>Open Sheet</Button>
            <Sheet open={open} onOpenChange={setOpen}>
                <div className={"bg-white dark:bg-surface-800 p-4 h-full"}>
                    Sheet Content
                </div>
            </Sheet>
        </div>
    );
}

```

## Sheet with Top Side

This example demonstrates a sheet that slides in from the top.

```tsx
import React, { useState } from "react";
import { Button, Sheet } from "@firecms/ui";

export default function SheetTopDemo() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <Button onClick={() => setOpen(true)}>Open Top Sheet</Button>
            <Sheet open={open} onOpenChange={setOpen} side="top">
                <div className={"bg-white dark:bg-surface-800 p-4 w-full"}>
                    Sheet Content
                </div>
            </Sheet>
        </div>
    );
}

```

## Transparent Sheet

This sheet is configured to be transparent.

```tsx
import React, { useState } from "react";
import { Sheet } from "@firecms/ui";

export default function SheetTransparentDemo() {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setOpen(true)}>Open Transparent Sheet</button>
            <Sheet open={open} onOpenChange={setOpen} transparent>
                <div style={{ padding: "1rem" }}>Transparent Sheet Content</div>
            </Sheet>
        </div>
    );
}
```

