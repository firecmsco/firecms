---
id: snackbars
title: Snackbars
sidebar_label: Snackbars
---

`useSnackbarController`
For displaying snackbars

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
