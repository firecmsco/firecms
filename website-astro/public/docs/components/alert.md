# Alert


Alerts are used to communicate a state or feedback to users. They often indicate success, information, warning, or errors.

## Color

The `color` prop is used to define the severity level of the alert.

```tsx
import React from "react";
import { Alert } from "@firecms/ui";

export default function AlertColorDemo() {
    return (
        <div className="space-y-4 w-full">
            <Alert color={"base"}>
                This is a simple alert.
            </Alert>
            <Alert color="error">
                This is an error alert.
            </Alert>
            <Alert color="warning">
                This is a warning alert.
            </Alert>
            <Alert color="info">
                This is an info alert.
            </Alert>
            <Alert color="success">
                This is a success alert.
            </Alert>
        </div>
    );
}

```

## Size

The `size` prop is used to define the size of the alert.

```tsx
import React from "react";
import { Alert } from "@firecms/ui";

export default function AlertSieDemo() {
    return (
        <div className="w-full space-y-4">
            <Alert size="small">
                This is an small alert.
            </Alert>
            <Alert size="medium">
                This is a medium alert.
            </Alert>
            <Alert size="large">
                This is a large alert.
            </Alert>
        </div>
    );
}

```

## Dismissable

Alerts can be dismissable when provided with the `onDismiss` callback function.

```tsx
import React, { useState } from "react";
import { Alert } from "@firecms/ui";

export default function DismissableAlertDemo() {
    const [visible, setVisible] = useState(true);
    return (
        <>
            {visible && (
                <Alert onDismiss={() => setVisible(false)} color="info">
                    This alert can be dismissed with the close button.
                </Alert>
            )}
        </>
    );
}

```

## Action Button

Include an interactive element within the alert using the `action` prop.

```tsx
import React from "react";
import { Alert, Button } from "@firecms/ui";

export default function AlertActionButtonDemo() {
    return (
        <Alert
            color="success"
            action={<Button size="small">Undo</Button>}
        >
            This alert contains an action button.
        </Alert>
    );
}

```

## Custom Styling

Pass custom CSS classes or styles with `className` and `style` props to customize the alert.

```tsx
import React from "react";
import { Alert } from "@firecms/ui";

export default function CustomStyleAlertDemo() {
    return (
        <Alert
            outerClassName="custom-class"
            style={{
                borderLeft: "4px solid #4ade80",
                color: "#fff",
                background: "repeating-linear-gradient(45deg,#606dbc,#606dbc 10px,#465298 10px,#465298 20px)"
            }}
            color="success"
        >
            This alert has custom styling.
        </Alert>
    );
}

```

