---
title: useModeController
sidebar_label: useModeController
description: Controlla la modalità del tema di FireCMS (chiaro, scuro o di sistema) con l'hook useModeController.
---

Usa questo hook per recuperare e controllare la modalità del tema corrente (`light`, `dark` o `system`).

:::note
Tieni presente che per usare questo hook **devi** essere in
un componente che è figlio del componente `FireCMS`.
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
            Modalità corrente: {modeController.mode}
        </Button>
    );
}
```
