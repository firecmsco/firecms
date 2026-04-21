# LoadingButton


The Loading Button component is utilized to display an actionable button with integrated loading feedback. This is useful to provide users immediate feedback on their actions that require asynchronous operations.

## Usage

To use the `LoadingButton`, import it along with necessary props. You can pass `loading`, `disabled`, `onClick`, `startIcon`, and other button props.

## Basic Loading Button

A simple loading button showcasing the loading state and default appearance.

```tsx
import React from "react";
import { LoadingButton } from "@firecms/ui";

export default function LoadingButtonBasicDemo() {
    const [loading, setLoading] = React.useState(false);

    const onClick = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    return (
        <LoadingButton
            loading={loading}
            onClick={onClick}>
                Click Me
        </LoadingButton>
    );
}

```

## Loading Button with Start Icon

A loading button example that includes a start icon which is displayed when the button is not in loading state.

```tsx
import React from "react";
import { AddIcon, LoadingButton } from "@firecms/ui";

export default function LoadingButtonWithIconDemo() {
    const [loading, setLoading] = React.useState(false);

    const onClick = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    return (
        <LoadingButton
            startIcon={<AddIcon size={"small"}/>}
            loading={loading}
            onClick={onClick}>
            Click Me
        </LoadingButton>
    );
}

```

