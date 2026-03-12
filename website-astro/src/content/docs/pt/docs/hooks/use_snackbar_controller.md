---
slug: pt/docs/hooks/use_snackbar_controller
title: useSnackbarController
sidebar_label: useSnackbarController
---

:::note
Per usare questi hook **devi** trovarti all'interno di un componente (non puoi usarli direttamente da una funzione callback).
In ogni caso, le callback solitamente includono un `FireCMSContext`, che include tutti i controller.
:::

Use this hook to get a snackbar controller to display snackbars, with a message,
a type and an optional title.

Le props fornite da questo hook sono:

* `isOpen` Is there currently an open snackbar
* `close()` Close the currently open snackbar
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Display a new snackbar. You need to specify the type and message. You can
  optionally specify a title

Esempio:

```tsx
import React from "react";
import { useSnackbarController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function ExampleCMSView() {

    const snackbarController = useSnackbarController();

    return (
        <Button
            onClick={() => snackbarController.open({
                type: "success",
                title: "Hey!",
                message: "Test snackbar"
            })}>
            Click me
        </Button>
    );
}
```
