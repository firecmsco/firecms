---
slug: fr/docs/hooks/use_dialogs_controller
title: useDialogsController
sidebar_label: useDialogsController
description: Hook pour ouvrir des dialogues de manière impérative dans FireCMS.
---

Utilisez ce hook pour ouvrir des dialogues de manière impérative. Cela est utile lorsque vous devez afficher un dialogue de confirmation ou une modale personnalisée depuis un callback ou un gestionnaire d'événements, où vous ne pouvez pas facilement rendre un composant.

:::note
Vous devez être un enfant du composant `FireCMS` pour utiliser ce hook.
:::

### Utilisation

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
                    <h2 className="text-xl font-bold mb-4">Bonjour !</h2>
                    <p className="mb-4">Ceci est un dialogue personnalisé.</p>
                    <Button onClick={closeDialog}>Fermer</Button>
                </div>
            )
        });
    };

    return <Button onClick={handleClick}>Ouvrir le dialogue</Button>;
}
```

### Interface

```tsx
export interface DialogsController {
    /**
     * Fermer le dernier dialogue
     */
    close: () => void;

    /**
     * Ouvrir un dialogue
     */
    open: <T extends object = object>(props: DialogControllerEntryProps<T>) => { closeDialog: () => void };
}
```

### Props

```tsx
export interface DialogControllerEntryProps<T extends object = object> {
    key: string;
    /**
     * Le type de composant qui sera rendu
     */
    Component: React.ComponentType<{ open: boolean, closeDialog: () => void } & T>;
    /**
     * Props à passer au composant de dialogue
     */
    props?: T;
}
```
