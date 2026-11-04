# useModeController

Use this hook to retrieve and control the current theme mode (`light`, `dark`, or `system`).

:::note
Please note that in order to use this hook you **must** be in
a component that is a child of the `FireCMS` component.
:::

### Props

```tsx
{
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
}
```

### Example

```tsx
import React from "react";
import { useModeController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ThemeToggle() {
    const modeController = useModeController();

    const toggleMode = () => {
        modeController.setMode(modeController.mode === "light" ? "dark" : "light");
    };

    return (
        <Button onClick={toggleMode}>
            Current mode: {modeController.mode}
        </Button>
    );
}
```

