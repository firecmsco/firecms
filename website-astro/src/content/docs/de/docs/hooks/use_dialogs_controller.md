---
slug: de/docs/hooks/use_dialogs_controller
title: useDialogsController
sidebar_label: useDialogsController
description: Hook zum imperativen Öffnen von Dialogen in FireCMS.
---

Verwenden Sie diesen Hook, um Dialoge imperativ zu öffnen. Dies ist nützlich, wenn Sie einen Bestätigungsdialog oder ein benutzerdefiniertes Modal aus einem Callback oder Event-Handler heraus anzeigen müssen, wo Sie nicht einfach eine Komponente rendern können.

:::note
Sie müssen ein Kind der `FireCMS`-Komponente sein, um diesen Hook zu verwenden.
:::

### Verwendung

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
                    <h2 className="text-xl font-bold mb-4">Hallo!</h2>
                    <p className="mb-4">Dies ist ein benutzerdefinierter Dialog.</p>
                    <Button onClick={closeDialog}>Schließen</Button>
                </div>
            )
        });
    };

    return <Button onClick={handleClick}>Dialog öffnen</Button>;
}
```

### Schnittstelle

```tsx
export interface DialogsController {
    /**
     * Den letzten Dialog schließen
     */
    close: () => void;

    /**
     * Einen Dialog öffnen
     */
    open: <T extends object = object>(props: DialogControllerEntryProps<T>) => { closeDialog: () => void };
}
```

### Props

```tsx
export interface DialogControllerEntryProps<T extends object = object> {
    key: string;
    /**
     * Der Komponententyp, der gerendert wird
     */
    Component: React.ComponentType<{ open: boolean, closeDialog: () => void } & T>;
    /**
     * Props, die an die Dialog-Komponente übergeben werden
     */
    props?: T;
}
```
