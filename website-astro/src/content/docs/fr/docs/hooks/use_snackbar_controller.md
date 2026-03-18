---
slug: fr/docs/hooks/use_snackbar_controller
title: useSnackbarController
sidebar_label: useSnackbarController
---

:::note
Veuillez noter que pour utiliser ces hooks, vous **devez** être dans
un composant (vous ne pouvez pas les utiliser directement depuis une fonction callback).
Cependant, les callbacks incluent généralement un `FireCMSContext`, qui contient tous
les contrôleurs.
:::

Utilisez ce hook pour obtenir un contrôleur de snackbar afin d'afficher des snackbars, avec un message,
un type et un titre optionnel.

Les propriétés fournies par ce hook sont :

* `isOpen` Y a-t-il actuellement un snackbar ouvert
* `close()` Fermer le snackbar actuellement ouvert
* `open ({ type: "success" | "info" | "warning" | "error"; title?: string; message: string; })`
  Afficher un nouveau snackbar. Vous devez spécifier le type et le message. Vous pouvez
  optionnellement spécifier un titre

Exemple :

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
                title: "Bonjour !",
                message: "Snackbar de test"
            })}>
            Cliquez ici
        </Button>
    );
}
```
