# Badge


Badges are small counts and labeling components used to add additional information to any content. They're commonly used to display unread counts, status indicators, or just as decorative nodes.

## Basic Badge

By setting the `invisible` prop to `true`, you can hide the badge, making it not visible to users.

```tsx
import React from "react";
import { Badge, Button, Chip } from "@firecms/ui";

export default function BadgeInvisibleDemo() {
    const [visible, setVisible] = React.useState<boolean | null>(true);
    return (
        <>
            <Badge color="primary" invisible={!visible}>
                <Chip>Content with Badge</Chip>
            </Badge>

            <Button onClick={() => setVisible(!visible)}>
                Toggle badge
            </Button>
        </>
    );
}

```

## Color Variants

The `color` prop determines the color of the badge. Possible values are `primary`, `secondary`, and `error`.

```tsx
import React from "react";
import { Badge, Chip } from "@firecms/ui";

export default function BadgeColorDemo() {
    return (
        <>
            <Badge color="primary">
                <Chip>Primary color</Chip>
            </Badge>

            <Badge color="secondary">
                <Chip>Secondary color</Chip>
            </Badge>

            <Badge color="error">
                <Chip>Error color</Chip>
            </Badge>
        </>
    );
}

```

## Usage with Icons and Buttons

Badges can be wrapped around icons or buttons to provide status indicators.

```tsx
import React from "react";
import { AnchorIcon, Badge, Button, IconButton } from "@firecms/ui";

export default function BadgeIconDemo() {
    return (
        <>
            <Badge color="error">
                <IconButton>
                    <AnchorIcon/>
                </IconButton>
            </Badge>

            <Badge color="secondary">
                <Button>
                    Fix
                </Button>
            </Badge>
        </>
    );
}

```

