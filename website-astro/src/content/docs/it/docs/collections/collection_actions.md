---
title: Azioni della barra collezione
slug: it/docs/collections/collection_actions
sidebar_label: Azioni della barra collezione
---


![collection_actions](/img/collection_actions.png)

Puoi aggiungere componenti personalizzati alla barra della collezione.

Questo è utile per aggiungere azioni specifiche alla collezione con cui stai lavorando.

Ad esempio, potresti aggiungere un pulsante per esportare i **dati selezionati**, o un pulsante per attivare una specifica **azione nel tuo backend**.

Puoi anche recuperare i **filtri selezionati** e modificarli.

### Esempio di recupero delle entità selezionate

Devi definire un componente che riceve `CollectionActionsProps` come props.

```tsx
import React from "react";
import { CollectionActionsProps, useSnackbarController } from "@firecms/core";
import { Button } from "@firecms/ui";

export function SampleCollectionActions({ selectionController }: CollectionActionsProps) {

    const snackbarController = useSnackbarController();

    const onClick = (event: React.MouseEvent) => {
        const selectedEntities = selectionController?.selectedEntities;
        const count = selectedEntities ? selectedEntities.length : 0;
        snackbarController.open({
            type: "success",
            message: `Codice definito dall'utente qui! ${count} prodotti selezionati`
        });
    };

    return (
        <Button onClick={onClick}
                color="primary"
                variant={"text"}>
            La mia azione personalizzata
        </Button>
    );

}
```

poi aggiungila alla configurazione della tua collezione:

```tsx
import { buildCollection, EntitySchema } from "@firecms/core";
import { SampleCollectionActions } from "./SampleCollectionActions";

export const productCollection: EntitySchema = buildCollection({
    name: "Products",
    Actions: SampleCollectionActions,
    // ...
});
```


### Esempio di modifica dei filtri

Questo è un esempio di come puoi modificare i filtri nella barra della collezione:

```tsx
import React from "react";
import { CollectionActionsProps } from "@firecms/core";
import { CloseIcon, IconButton, Select, SelectItem } from "@firecms/ui";

export function CustomFiltersActions({
                                         tableController
                                     }: CollectionActionsProps) {

    const filterValues = tableController.filterValues;
    const categoryFilter = filterValues?.category;
    const categoryFilterValue = categoryFilter?.[1];

    const updateFilter = (value: string | null) => {
        const newFilter = {
            ...filterValues
        };
        if (value) {
            newFilter.category = ["==", value];
        } else {
            delete newFilter.category;
        }
        tableController.setFilterValues?.(newFilter);
    };

    return (
        <Select placeholder={"Filtro categoria"}
                className={"w-44"}
                endAdornment={categoryFilterValue ?
                    <IconButton size={"small"} onClick={() => updateFilter(null)}>
                        <CloseIcon size={"smallest"}/>
                    </IconButton> : undefined}
                onValueChange={updateFilter}
                size={"small"}
                value={categoryFilterValue}>
            <SelectItem value="cameras">Cameras</SelectItem>
            <SelectItem value="bath">Bath</SelectItem>
        </Select>
    );

}

```

poi aggiungila alla configurazione della tua collezione:

```tsx
import { buildCollection, EntitySchema } from "@firecms/core";
import { CustomFiltersActions } from "./SampleCollectionActions";

export const productCollection: EntitySchema = buildCollection({
    name: "Products",
    Actions: CustomFiltersActions,
    // ...
});
```


## CollectionActionsProps

Le seguenti proprietà sono disponibili nell'interfaccia `CollectionActionsProps`:

- **`path`**: Percorso completo della collezione di questa entità. Questo è il percorso completo, come `users/1234/addresses`.

- **`relativePath`**: Percorso dell'ultima collezione, come `addresses`.

- **`parentCollectionIds`**: Array dei segmenti del percorso genitore come `['users']`.

- **`collection`**: La configurazione della collezione.

- **`selectionController`**: Usa questo controller per ottenere le entità selezionate e aggiornare lo stato delle entità selezionate.

- **`tableController`**: Usa questo controller per ottenere il controller della tabella e aggiornare il suo stato.

- **`context`**: Contesto dello stato dell'app.

- **`collectionEntitiesCount`**: Conteggio delle entità in questa collezione.
