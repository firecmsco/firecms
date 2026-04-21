# Popover


Popover component allows you to float a content panel anchored to another element, perfect for context menus, hover cards, tooltips, and much more.

## Usage

To use the `Popover`, import it from your components and pass the required `trigger` and optional `open`, `onOpenChange`, `side`, `sideOffset`, `align`, `alignOffset`, `arrowPadding`, `sticky`, `hideWhenDetached`, `avoidCollisions`, `enabled`, and `modal` props.

## Basic Popover

A simple popover that shows upon clicking the trigger element.

```tsx
import React from "react";
import { Button, Popover } from "@firecms/ui";

export default function PopoverBasicDemo() {
    return (
        <Popover
            trigger={<Button>Open Popover</Button>}
        >
            <div className="p-4">
                This is a basic Popover.
            </div>
        </Popover>
    );
}

```

## Popover with Alignment

Showcasing how to align the popover content relative to the trigger element.

```tsx
import React from "react";
import { Button, Popover } from "@firecms/ui";

export default function PopoverAlignDemo() {
    return (
        <div>
            <Popover
                trigger={<Button>Open Left</Button>}
                side="left"
            >
                <div className="p-4">
                    Aligned to the left.
                </div>
            </Popover>
            <Popover
                trigger={<Button>Open Bottom</Button>}
                side="bottom"
            >
                <div className="p-4">
                    Aligned to the bottom.
                </div>
            </Popover>
        </div>
    );
}

```

## Controlled Popover

Demonstrates the usage of `open` and `onOpenChange` props for controlled behavior.

```tsx
import React, { useState } from "react";
import { Button, Popover } from "@firecms/ui";

export default function PopoverControlledDemo() {
    const [open, setOpen] = useState(false);

    return (
        <Popover
            trigger={<Button onClick={() => setOpen(!open)}>Toggle Popover</Button>}
            open={open}
            onOpenChange={setOpen}
        >
            <div className="p-4">
                This Popover's visibility is controlled externally.
            </div>
        </Popover>
    );
}

```

## Usage with Custom Styling

Illustrating custom styling applied to the popover content.

```tsx
import React from "react";
import { Button, Popover } from "@firecms/ui";

export default function PopoverStyledDemo() {
    return (
        <Popover
            trigger={<Button>Open Custom Styled Popover</Button>}
            className="bg-purple-500 text-white p-3 rounded-lg shadow-lg"
        >
            <div>
                This Popover has custom styles applied.
            </div>
        </Popover>
    );
}

```

