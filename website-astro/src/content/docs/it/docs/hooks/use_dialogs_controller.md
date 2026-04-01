---
slug: it/docs/hooks/use_dialogs_controller
title: useDialogsController
sidebar_label: useDialogsController
description: Hook per aprire finestre di dialogo in modo imperativo in FireCMS.
---

Usa questo hook per aprire finestre di dialogo in modo imperativo. È utile quando devi mostrare un dialogo di conferma o un modale personalizzato da un callback o un gestore di eventi, dove non puoi facilmente renderizzare un componente.

:::note
Devi essere un figlio del componente `FireCMS` per usare questo hook.
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
                    <p className="mb-4">Questa è una finestra di dialogo personalizzata.</p>
                    <Button onClick={closeDialog}>Chiudi</Button>
                </div>
            )
        });
    };

    return <Button onClick={handleClick}>Apri Dialogo</Button>;
}
```

### Interfaccia

```tsx
export interface DialogsController {
    /**
     * Chiudere l'ultimo dialogo
     */
    close: () => void;

    /**
     * Aprire un dialogo
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
     * Props da passare al componente del dialogo
     */
    props?: T;
}
```
