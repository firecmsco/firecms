---
slug: fr/docs/hooks/use_mode_controller
title: useModeController
sidebar_label: useModeController
description: Contrôlez le mode de thème de FireCMS (clair, sombre ou système) avec le hook useModeController.
---

Utilisez ce hook pour récupérer et contrôler le mode de thème actuel (`light`, `dark` ou `system`).

:::note
Veuillez noter que pour utiliser ce hook, vous **devez** être dans
un composant qui est un enfant du composant `FireCMS`.
:::

### Props

```tsx
{
    mode: "light" | "dark";
    setMode: (mode: "light" | "dark") => void;
}
```

### Exemple

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
            Mode actuel : {modeController.mode}
        </Button>
    );
}
```
