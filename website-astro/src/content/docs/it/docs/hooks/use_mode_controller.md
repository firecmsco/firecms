---
slug: it/docs/hooks/use_mode_controller
title: useModeController
sidebar_label: useModeController
description: Controlla il modo tema di FireCMS (chiaro, scuro o sistema) con l'hook useModeController.
---

Usa questo hook per ottenere e controllare il modo tema corrente (`light`, `dark` o `system`).

:::note
Tieni presente che per utilizzare questo hook **devi** essere all'interno
di un componente figlio del componente `FireCMS`.
:::

### Props

```tsx
{
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
}
```

### Esempio

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
            Modo attuale: {modeController.mode}
        </Button>
    );
}
```
