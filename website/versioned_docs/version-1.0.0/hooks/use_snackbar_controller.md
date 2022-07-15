---
id: use_snackbar_controller
title: useSnackbarController
sidebar_label: useSnackbarController
---

:::note
Please note that in order to use these hooks you **must** be in
a component (you can't use them directly from a callback function).
Anyhow, callbacks usually include a `FireCMSContext`, which includes all
the controllers.
:::

Use this hook to get a snackbar controller to display snackbars, with a message,
a type and an optional title.

The props provided by this context are:

* `isOpen` Is there currently an open snackbar
* `close()` Close the currently open snackbar
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Display a new snackbar. You need to specify the type and message. You can
  optionally specify a title

Example:

```tsx

import React from "react";
import { useSnackbarController } from "@camberi/firecms";

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
