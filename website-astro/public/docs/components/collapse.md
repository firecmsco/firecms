# Collapse


Collapse components are used to show and hide content. React animation is used for the transition. Use it to toggle visibility of content.

## Usage

To use the `Collapse`, you need to import it from where it's defined, pass children to be displayed within the collapse component, and control its open state. Optionally, you can also customize its duration of the animation.

## Basic Collapse

A simple example of how to use the Collapse component.

```tsx
import React, { useState } from "react";
import { Button, Collapse, Paper } from "@firecms/ui";

export default function CollapseBasicDemo() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className={"flex flex-col items-center gap-4"}>
            <Button onClick={() => setIsOpen(!isOpen)}>Toggle</Button>
            <Collapse in={isOpen}>
                <Paper className={"p-4"}>
                    Content to show or hide
                </Paper>
            </Collapse>
        </div>
    );
}

```

## Custom Duration Collapse

Illustrates how to use a custom duration for the collapse animation.

```tsx
import React, { useState } from "react";
import { Button, Collapse, Container, Paper } from "@firecms/ui";

export default function CollapseCustomDurationDemo() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={"flex flex-col items-center gap-4"}>
            <Button onClick={() => setIsOpen(!isOpen)}>Toggle</Button>
            <Collapse in={isOpen} duration={500}>
                <Paper className={"p-4"}>
                    This content has a custom animation duration.
                </Paper>
            </Collapse>
        </div>
    );
}

```

