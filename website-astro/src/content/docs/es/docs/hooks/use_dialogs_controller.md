---
title: useDialogsController
sidebar_label: useDialogsController
description: Hook para abrir diálogos de forma imperativa en FireCMS.
---

Usa este hook para abrir diálogos de forma imperativa. Es útil cuando necesitas mostrar un diálogo de confirmación o un modal personalizado desde un callback o un manejador de eventos, donde no puedes renderizar fácilmente un componente.

:::note
Necesitas ser hijo del componente `FireCMS` para usar este hook.
:::

### Uso

```tsx
import React from "react";
import { useDialogsController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function MyComponent() {
    const dialogsController = useDialogsController();

    const handleClick = () => {
        dialogsController.open({
            key: "my_dialog",
            Component: ({ open, closeDialog }) => (
                <div className="p-4 bg-white rounded shadow-lg">
                    <h2 className="text-xl font-bold mb-4">¡Hola!</h2>
                    <p className="mb-4">Este es un diálogo personalizado.</p>
                    <Button onClick={closeDialog}>Cerrar</Button>
                </div>
            )
        });
    };

    return <Button onClick={handleClick}>Abrir Diálogo</Button>;
}
```

### Interfaz

```tsx
export interface DialogsController {
    /**
     * Cerrar el último diálogo
     */
    close: () => void;

    /**
     * Abrir un diálogo
     */
    open: <T extends object = object>(props: DialogControllerEntryProps<T>) => { closeDialog: () => void };
}
```

### Props

```tsx
export interface DialogControllerEntryProps<T extends object = object> {
    key: string;
    /**
     * El tipo de componente que se renderizará
     */
    Component: React.ComponentType<{ open: boolean, closeDialog: () => void } & T>;
    /**
     * Props a pasar al componente de diálogo
     */
    props?: T;
}
```
