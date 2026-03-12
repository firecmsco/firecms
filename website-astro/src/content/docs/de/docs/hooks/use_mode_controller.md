---
slug: de/docs/hooks/use_mode_controller
title: useModeController
sidebar_label: useModeController
description: Den FireCMS-Theme-Modus (hell, dunkel oder System) mit dem useModeController-Hook steuern.
---

Verwenden Sie diesen Hook, um den aktuellen Theme-Modus (`light`, `dark`) abzurufen und zu steuern.

:::note
Bitte beachten Sie, dass Sie zur Verwendung dieses Hooks **in einer Komponente** sein müssen, die ein Kind der `FireCMS`-Komponente ist.
:::

### Props

```tsx
{
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
}
```

### Beispiel

```tsx
import React from "react";
import { useModeController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ThemeToggle() {
    const { mode, setMode } = useModeController();
    
    return (
        <Button onClick={() => setMode(mode === "light" ? "dark" : "light")}>
            Zu {mode === "light" ? "Dunkel" : "Hell"} wechseln
        </Button>
    );
}
```
