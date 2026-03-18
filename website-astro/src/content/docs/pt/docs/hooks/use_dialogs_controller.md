---
slug: pt/docs/hooks/use_dialogs_controller
title: useDialogsController
sidebar_label: useDialogsController
description: Hook para abrir diálogos de forma imperativa no FireCMS.
---

Use este hook para abrir diálogos de forma imperativa. Isso é útil quando você precisa mostrar um diálogo de confirmação ou um modal personalizado a partir de um callback ou manipulador de eventos, onde não é possível renderizar facilmente um componente.

:::note
Você precisa ser filho do componente `FireCMS` para usar este hook.
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
                    <h2 className="text-xl font-bold mb-4">Olá!</h2>
                    <p className="mb-4">Este é um diálogo personalizado.</p>
                    <Button onClick={closeDialog}>Fechar</Button>
                </div>
            )
        });
    };

    return <Button onClick={handleClick}>Abrir Diálogo</Button>;
}
```

### Interface

```tsx
export interface DialogsController {
    /**
     * Fechar o último diálogo
     */
    close: () => void;

    /**
     * Abrir um diálogo
     */
    open: <T extends object = object>(props: DialogControllerEntryProps<T>) => { closeDialog: () => void };
}
```

### Props

```tsx
export interface DialogControllerEntryProps<T extends object = object> {
    key: string;
    /**
     * O tipo de componente que será renderizado
     */
    Component: React.ComponentType<{ open: boolean, closeDialog: () => void } & T>;
    /**
     * Props para passar ao componente do diálogo
     */
    props?: T;
}
```
