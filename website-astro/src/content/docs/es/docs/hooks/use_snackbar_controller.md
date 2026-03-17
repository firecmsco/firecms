---
title: useSnackbarController
sidebar_label: useSnackbarController
---

:::note
Ten en cuenta que para usar estos hooks **debes** estar en
un componente (no puedes usarlos directamente desde una función callback).
De todos modos, los callbacks generalmente incluyen un `FireCMSContext`, que incluye todos
los controladores.
:::

Usa este hook para obtener un controlador de snackbar para mostrar snackbars, con un mensaje,
un tipo y un título opcional.

Las props proporcionadas por este hook son:

* `isOpen` Indica si hay actualmente un snackbar abierto
* `close()` Cerrar el snackbar actualmente abierto
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Mostrar un nuevo snackbar. Necesitas especificar el tipo y el mensaje. Opcionalmente
  puedes especificar un título

Ejemplo:

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
                title: "¡Hola!",
                message: "Snackbar de prueba"
            })}>
            Haz clic aquí
        </Button>
    );
}
```
