---
slug: pt/docs/hooks/use_snackbar_controller
title: useSnackbarController
sidebar_label: useSnackbarController
---

:::note
Observe que para usar esses hooks você **deve** estar dentro
de um componente (não é possível usá-los diretamente em uma função callback).
No entanto, os callbacks geralmente incluem um `FireCMSContext`, que contém todos
os controladores.
:::

Use este hook para obter um controlador de snackbar para exibir snackbars, com uma mensagem,
um tipo e um título opcional.

As propriedades fornecidas por este hook são:

* `isOpen` Existe atualmente um snackbar aberto
* `close()` Fechar o snackbar atualmente aberto
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Exibir um novo snackbar. Você precisa especificar o tipo e a mensagem. Opcionalmente
  pode especificar um título

Exemplo:

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
                title: "Olá!",
                message: "Snackbar de teste"
            })}>
            Clique aqui
        </Button>
    );
}
```
