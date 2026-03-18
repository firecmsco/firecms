---
slug: it/docs/hooks/use_snackbar_controller
title: useSnackbarController
sidebar_label: useSnackbarController
---

:::note
Tieni presente che per utilizzare questi hook **devi** essere all'interno
di un componente (non puoi usarli direttamente da una funzione callback).
Tuttavia, i callback di solito includono un `FireCMSContext`, che contiene tutti
i controller.
:::

Usa questo hook per ottenere un controller snackbar per visualizzare snackbar, con un messaggio,
un tipo e un titolo opzionale.

Le proprietà fornite da questo hook sono:

* `isOpen` C'è attualmente una snackbar aperta
* `close()` Chiudere la snackbar attualmente aperta
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Visualizzare una nuova snackbar. Devi specificare il tipo e il messaggio. Puoi
  opzionalmente specificare un titolo

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
                title: "Ciao!",
                message: "Snackbar di prova"
            })}>
            Clicca qui
        </Button>
    );
}
```
