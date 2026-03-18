---
slug: es/docs/hooks/use_snackbar_controller
title: useSnackbarController
sidebar_label: useSnackbarController
---

:::note
Tenga en cuenta que para usar estos hooks **debe** estar en
un componente (no puede usarlos directamente desde una función callback).
De todas formas, los callbacks generalmente incluyen un `FireCMSContext`, que contiene todos
los controladores.
:::

Use este hook para obtener un controlador de snackbar para mostrar snackbars, con un mensaje,
un tipo y un título opcional.

Las propiedades proporcionadas por este hook son:

* `isOpen` ¿Hay actualmente un snackbar abierto?
* `close()` Cerrar el snackbar actualmente abierto
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Mostrar un nuevo snackbar. Necesita especificar el tipo y el mensaje. Opcionalmente
  puede especificar un título

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
