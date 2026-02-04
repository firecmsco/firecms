---
slug: docs/hooks/use_dialogs_controller
title: useDialogsController
sidebar_label: useDialogsController
description: Hook to open dialogs imperatively in FireCMS.
---

Use this hook to open dialogs imperatively. This is useful when you need to show a confirmation dialog or a custom modal from a callback or an event handler, where you can't easily render a component.

:::note
You need to be a child of the `FireCMS` component to use this hook.
:::

### Usage

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
                    <h2 className="text-xl font-bold mb-4">Hello!</h2>
                    <p className="mb-4">This is a custom dialog.</p>
                    <Button onClick={closeDialog}>Close</Button>
                </div>
            )
        });
    };

    return <Button onClick={handleClick}>Open Dialog</Button>;
}
```

### Interface

```tsx
export interface DialogsController {
    /**
     * Close the last dialog
     */
    close: () => void;

    /**
     * Open a dialog
     */
    open: <T extends object = object>(props: DialogControllerEntryProps<T>) => { closeDialog: () => void };
}
```

### Props

```tsx
export interface DialogControllerEntryProps<T extends object = object> {
    key: string;
    /**
     * The component type that will be rendered
     */
    Component: React.ComponentType<{ open: boolean, closeDialog: () => void } & T>;
    /**
     * Props to pass to the dialog component
     */
    props?: T;
}
```
