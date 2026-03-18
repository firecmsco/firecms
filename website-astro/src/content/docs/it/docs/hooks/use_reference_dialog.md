---
slug: it/docs/hooks/use_reference_dialog
title: useReferenceDialog
sidebar_label: useReferenceDialog
---

:::note
Tieni presente che per utilizzare questo hook **devi** essere all'interno di un
componente (non puoi usarlo direttamente da una funzione callback).
:::

## `useReferenceDialog`

Questo hook viene utilizzato per aprire un dialogo laterale che permette la selezione di entità
sotto un dato percorso. Puoi usarlo nelle viste personalizzate per selezionare entità.
Devi specificare almeno il percorso della collezione di destinazione. Se la tua collezione
non è definita nella configurazione principale delle collezioni
(nel tuo componente `FireCMS`), devi specificarla esplicitamente. Questo è lo stesso
hook utilizzato internamente quando viene definita una proprietà di riferimento.

Le proprietà fornite da questo hook sono:

*     multiselect?: boolean;
  Permettere la selezione multipla di valori

*     collection?: EntityCollection;
  Configurazione della collezione di entità

*     path: string;
  Percorso assoluto della collezione.
  Può non essere impostato se questo hook viene usato in un componente e il percorso è
  dinamico. Se non impostato, il dialogo non si aprirà.

*     selectedEntityIds?: string[];
  Se stai aprendo il dialogo per la prima volta, puoi selezionare alcuni
  id di entità da visualizzare per primi.

*     onSingleEntitySelected?(entity: Entity | null): void;
  Se `multiselect` è impostato su `false`, otterrai l'entità selezionata
  in questo callback.

*     onMultipleEntitiesSelected?(entities: Entity[]): void;
  Se `multiselect` è impostato su `false`, otterrai le entità selezionate
  in questo callback.

*     onClose?(): void;
  Se il dialogo è attualmente aperto, chiuderlo

*     forceFilter?: FilterValues;
  Consentire la selezione solo delle entità che superano il filtro specificato.

Esempio:

```tsx
import React from "react";
import { useReferenceDialog, useSnackbarController, Entity } from "@firecms/core";
import { Button } from "@firecms/ui";

type Product = {
    name: string;
    price: number;
};

export function ExampleCMSView() {

    // hook per mostrare snackbar personalizzate
    const snackbarController = useSnackbarController();

    // hook per aprire un dialogo di riferimento
    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Selezionato " + entity?.values.name
            })
        }
    });

    return <Button
        onClick={referenceDialog.open}
        color="primary">
        Testa dialogo di riferimento
    </Button>;
}
```
