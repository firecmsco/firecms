---
title: useSnackbarController
sidebar_label: useSnackbarController
---

:::note
Bitte beachten Sie, dass Sie zur Verwendung dieser Hooks **in einer Komponente** sein müssen.
Callbacks beinhalten normalerweise einen `FireCMSContext`, der alle Controller enthält.
:::

Verwenden Sie diesen Hook, um einen Snackbar-Controller zu erhalten und Snackbars mit einer Nachricht, einem Typ und einem optionalen Titel anzuzeigen.

Die von diesem Hook bereitgestellten Props sind:

* `isOpen` Ist derzeit ein Snackbar geöffnet
* `close()` Den aktuell geöffneten Snackbar schließen
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Einen neuen Snackbar anzeigen. Sie müssen den Typ und die Nachricht angeben.

Beispiel:

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
            Klick mich
        </Button>
    );
}
```
