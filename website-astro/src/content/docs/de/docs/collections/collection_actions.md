---
title: Aktionsleisten für Kollektionen
slug: de/docs/collections/collection_actions
sidebar_label: Aktionsleisten für Kollektionen
---


![collection_actions](/img/collection_actions.png)

Sie können benutzerdefinierte Komponenten zur Kollektionsleiste hinzufügen.

Dies ist nützlich, um Aktionen hinzuzufügen, die spezifisch für die Kollektion sind, mit der Sie arbeiten.

Zum Beispiel könnten Sie eine Schaltfläche hinzufügen, um die **ausgewählten Daten** zu exportieren, oder eine Schaltfläche, um eine bestimmte **Aktion in Ihrem Backend** auszulösen.

Sie können auch die **ausgewählten Filter** abrufen und ändern.

### Beispiel: Ausgewählte Entities abrufen

Sie müssen eine Komponente definieren, die `CollectionActionsProps` als Props erhält.

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
            message: `User defined code here! ${count} products selected`
        });
    };

    return (
        <Button onClick={onClick}
                color="primary"
                variant={"text"}>
            My custom action
        </Button>
    );

}
```

Dann einfach zur Kollektionskonfiguration hinzufügen:

```tsx
import { buildCollection, EntitySchema } from "@firecms/core";
import { SampleCollectionActions } from "./SampleCollectionActions";

export const productCollection: EntitySchema = buildCollection({
    name: "Products",
    Actions: SampleCollectionActions,
    // ...
});
```


### Beispiel: Filter ändern

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
        <Select placeholder={"Category filter"}
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

Dann einfach zur Kollektionskonfiguration hinzufügen:

```tsx
export const productCollection: EntitySchema = buildCollection({
    name: "Products",
    Actions: CustomFiltersActions,
    // ...
});
```


## CollectionActionsProps

- **`path`**: Vollständiger Kollektionspfad dieser Entity.

- **`relativePath`**: Pfad der letzten Kollektion, wie `addresses`.

- **`parentCollectionIds`**: Array der übergeordneten Pfadsegmente wie `['users']`.

- **`collection`**: Die Kollektionskonfiguration.

- **`selectionController`**: Verwenden Sie diesen Controller, um ausgewählte Entities zu erhalten und den Auswahlstatus zu aktualisieren.

- **`tableController`**: Verwenden Sie diesen Controller, um den Tabellen-Controller zu erhalten und zu aktualisieren.

- **`context`**: Kontext des App-Status.

- **`collectionEntitiesCount`**: Anzahl der Entities in dieser Kollektion.
