---
slug: de/docs/hooks/use_snackbar_controller
title: useSnackbarController
sidebar_label: useSnackbarController
---

:::note
Bitte beachten Sie, dass Sie diese Hooks **nur** innerhalb
einer Komponente verwenden können (Sie können sie nicht direkt in einer Callback-Funktion verwenden).
Callbacks enthalten in der Regel jedoch einen `FireCMSContext`, der alle
Controller enthält.
:::

Verwenden Sie diesen Hook, um einen Snackbar-Controller zum Anzeigen von Snackbars mit einer Nachricht,
einem Typ und einem optionalen Titel zu erhalten.

Die von diesem Hook bereitgestellten Eigenschaften sind:

* `isOpen` Ist derzeit eine Snackbar geöffnet
* `close()` Die aktuell geöffnete Snackbar schließen
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Eine neue Snackbar anzeigen. Sie müssen den Typ und die Nachricht angeben. Optional
  können Sie einen Titel angeben

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
                title: "Hallo!",
                message: "Test-Snackbar"
            })}>
            Klick mich
        </Button>
    );
}
```
