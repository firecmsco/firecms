---
slug: es/docs/hooks/use_mode_controller
title: useModeController
sidebar_label: useModeController
description: Controla el modo de tema de FireCMS (claro, oscuro o sistema) con el hook useModeController.
---

Usa este hook para obtener y controlar el modo de tema actual (`light`, `dark` o `system`).

:::note
Ten en cuenta que para usar este hook **debes** estar en
un componente que sea hijo del componente `FireCMS`.
:::

### Props

```tsx
{
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
}
```

### Ejemplo

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
            Modo actual: {modeController.mode}
        </Button>
    );
}
```
