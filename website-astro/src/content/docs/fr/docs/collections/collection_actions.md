---
title: Actions de la barre de collection
sidebar_label: Actions de la barre de collection
---


![collection_actions](/img/collection_actions.png)

Vous pouvez ajouter vos composants personnalisés à la barre de collection.

C'est utile pour ajouter des actions spécifiques à la collection avec laquelle vous travaillez.

Par exemple, vous pourriez ajouter un bouton pour exporter les **données sélectionnées**, ou un bouton pour déclencher une **action spécifique dans votre backend**.

Vous pouvez également récupérer les **filtres sélectionnés** et les modifier.

### Exemple de récupération des entités sélectionnées

Vous devez définir un composant qui reçoit `CollectionActionsProps` comme props.

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
            message: `Votre code ici ! ${count} produits sélectionnés`
        });
    };

    return (
        <Button onClick={onClick}
                color="primary"
                variant={"text"}>
            Mon action personnalisée
        </Button>
    );

}
```

puis ajoutez-le simplement à votre configuration de collection :

```tsx
import { buildCollection, EntitySchema } from "@firecms/core";
import { SampleCollectionActions } from "./SampleCollectionActions";

export const productCollection: EntitySchema = buildCollection({
    name: "Products",
    Actions: SampleCollectionActions,
    // ...
});
```


### Exemple de modification des filtres

Voici un exemple de modification des filtres dans la barre de collection :

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

puis ajoutez-le simplement à votre configuration de collection :

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

Les propriétés suivantes sont disponibles sur l'interface `CollectionActionsProps` :

- **`path`** : Chemin complet de collection de cette entité. Il s'agit du chemin complet, comme `users/1234/addresses`.

- **`relativePath`** : Chemin de la dernière collection, comme `addresses`.

- **`parentCollectionIds`** : Tableau des segments de chemin parent comme `['users']`.

- **`collection`** : La configuration de la collection.

- **`selectionController`** : Utilisez ce contrôleur pour obtenir les entités sélectionnées et mettre à jour l'état des entités sélectionnées.

- **`tableController`** : Utilisez ce contrôleur pour obtenir le contrôleur de tableau et mettre à jour l'état du contrôleur de tableau.

- **`context`** : Contexte de l'état de l'application.

- **`collectionEntitiesCount`** : Nombre d'entités dans cette collection.
