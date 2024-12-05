---
id: collection_actions
title: Collection Bar Actions
sidebar_label: Collection Bar Actions
---


![collection_actions](/img/collection_actions.png)

You can add your custom components to the collection bar.

This is useful to add actions that are specific to the collection you are working with.

For example, you could add a button to export the **selected data**, or a button to trigger a specific **action in your backend**.

You can also retrieve the **selected filters** and modify them.

### Sample retrieving selected entities

You need to define a component that receives `CollectionActionsProps` as props.

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

then just add it to your collection configuration:

```tsx
import { buildCollection, EntitySchema } from "@firecms/core";
import { SampleCollectionActions } from "./SampleCollectionActions";

export const productCollection: EntitySchema = buildCollection({
    name: "Products",
    Actions: SampleCollectionActions,
    // ...
});
```


### Sample modifying filters

This is an example of how you can modify the filters in the collection bar:

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

then just add it to your collection configuration:

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

The following properties are available on the `CollectionActionsProps` interface:

- **`path`**: Full collection path of this entity. This is the full path, like `users/1234/addresses`.

- **`relativePath`**: Path of the last collection, like `addresses`.

- **`parentCollectionIds`**: Array of the parent path segments like `['users']`.

- **`collection`**: The collection configuration.

- **`selectionController`**: Use this controller to get the selected entities and to update the selected entities state.

- **`tableController`**: Use this controller to get the table controller and to update the table controller state.

- **`context`**: Context of the app status.

- **`collectionEntitiesCount`**: Count of the entities in this collection.
