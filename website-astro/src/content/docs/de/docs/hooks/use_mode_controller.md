---
slug: de/docs/hooks/use_mode_controller
title: useModeController
sidebar_label: useModeController
description: Steuern Sie den FireCMS-Themenmodus (hell, dunkel oder System) mit dem useModeController-Hook.
---

Verwenden Sie diesen Hook, um den aktuellen Themenmodus (`light`, `dark` oder `system`) abzurufen und zu steuern.

:::note
Bitte beachten Sie, dass Sie diesen Hook **nur** innerhalb
einer Komponente verwenden können, die ein Kind der `FireCMS`-Komponente ist.
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
    const modeController = useModeController();

    const toggleMode = () => {
        modeController.setMode(modeController.mode === "light" ? "dark" : "light");
    };

    return (
        <Button onClick={toggleMode}>
            Aktueller Modus: {modeController.mode}
        </Button>
    );
}
```
