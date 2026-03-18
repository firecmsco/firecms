---
slug: pt/docs/hooks/use_mode_controller
title: useModeController
sidebar_label: useModeController
description: Controle o modo de tema do FireCMS (claro, escuro ou sistema) com o hook useModeController.
---

Use este hook para obter e controlar o modo de tema atual (`light`, `dark` ou `system`).

:::note
Observe que para usar este hook você **deve** estar em
um componente que seja filho do componente `FireCMS`.
:::

### Props

```tsx
{
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
}
```

### Exemplo

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
            Modo atual: {modeController.mode}
        </Button>
    );
}
```
