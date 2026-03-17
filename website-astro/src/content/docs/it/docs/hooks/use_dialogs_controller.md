---
title: useDialogsController
sidebar_label: useDialogsController
description: Hook per aprire dialog in modo imperativo in FireCMS.
---

Usa questo hook per aprire dialog in modo imperativo. È utile quando hai bisogno di mostrare un dialog di conferma o una modale personalizzata da un callback o un gestore di eventi, dove non puoi facilmente renderizzare un componente.

:::note
Devi essere figlio del componente `FireCMS` per usare questo hook.
:::

### Utilizzo

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
                    <h2 className="text-xl font-bold mb-4">Ciao!</h2>
                    <p className="mb-4">Questo è un dialog personalizzato.</p>
                    <Button onClick={closeDialog}>Chiudi</Button>
                </div>
            )
        });
    };

    return <Button onClick={handleClick}>Apri Dialog</Button>;
}
```

### Interfaccia

```tsx
export interface DialogsController {
    /**
     * Chiudi l'ultimo dialog
     */
    close: () => void;

    /**
     * Apri un dialog
     */
    open: <T extends object = object>(props: DialogControllerEntryProps<T>) => { closeDialog: () => void };
}
```

### Props

```tsx
export interface DialogControllerEntryProps<T extends object = object> {
    key: string;
    /**
     * Il tipo di componente che verrà renderizzato
     */
    Component: React.ComponentType<{ open: boolean, closeDialog: () => void } & T>;
    /**
     * Props da passare al componente dialog
     */
    props?: T;
}
```
