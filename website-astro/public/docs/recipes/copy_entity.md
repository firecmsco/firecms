# Copying an entity from one collection to another

![Product selection](/img/product_selection.webp)

In this tutorial we will show how you can add a button to your collection,
that will allow you to **copy entities from another collection**.

It is very common in NoSQL databases, such as Firestore, to keep denormalized
data in different collections. That is, keeping the same information in multiple
locations, instead of normalized databases where information should be ideally
stored only once.

### Declare your collections

For illustrative purposes, let's create two simple `products` collection,
that we will be copying from and to:

```tsx
import { buildCollection, buildProperties } from "@firecms/core";

export type Product = {
    name: string;
    price: number;
}

// Common properties of our target and source collections
export const properties = buildProperties<Product>({
    name: {
        name: "Name",
        validation: { required: true },
        dataType: "string"
    },
    price: {
        name: "Price",
        validation: {
            required: true,
            min: 0
        },
        dataType: "number"
    }
});

// Source collection
export const productsCollection = buildCollection<Product>({
    name: "Products",
    id: "products",
    path: "products",
    properties
});

// Target collection
export const productsCollectionCopy = buildCollection<Product>({
    name: "Products copy target",
    id: "products_copied",
    path: "products_copied",
    properties
});

```

### Add a custom action to your collection

For the next step we will add a custom button to our target collection.
This button will open a reference dialog and allow users to select an entity in
the source.

This example is using some hooks provided by FireCMS for developing
custom component.

```tsx
import { useCallback } from "react";
import { Entity, EntityCollection, useDataSource, useReferenceDialog, useSnackbarController } from "@firecms/core";
import { Button } from "@firecms/ui";

export type CopyEntityButtonProps = {
    pathFrom: string;
    pathTo: string;
    collectionFrom: EntityCollection;
    collectionTo: EntityCollection;
};

export function CopyEntityButton({
                                     pathFrom,
                                     collectionFrom,
                                     pathTo,
                                     collectionTo
                                 }: CopyEntityButtonProps) {

    // The datasource allows us to create new documents
    const dataSource = useDataSource();

    // We use a snackbar to indicate success
    const snackbarController = useSnackbarController();

    // We declare a callback function for the reference dialog that will
    // create the new entity and show a snackbar when completed
    const copyEntity = useCallback((entity: Entity<any> | null) => {
        if (entity) {
            dataSource.saveEntity({
                path: pathTo,
                values: entity.values,
                entityId: entity.id,
                collection: collectionTo,
                status: "new"
            }).then(() => {
                snackbarController.open({
                    type: "success",
                    message: "Copied entity " + entity.id
                });
            });
        }
    }, [collectionTo, dataSource, pathTo, snackbarController]);

    // This dialog is used to prompt the selected collection
    const referenceDialog = useReferenceDialog({
        path: pathFrom,
        collection: collectionFrom,
        multiselect: false,
        onSingleEntitySelected: copyEntity
    });

    return (
        <Button onClick={referenceDialog.open}>
            Copy from {pathFrom}
        </Button>
    );
}

```

### Add the custom copy action

After your component is ready, you can plug it into your collections `Actions`:

```tsx
import { buildCollection, CollectionActionsProps } from "@firecms/core";
import { CopyEntityButton } from "./copy_button";
import { Product, productsCollection, properties } from "./simple_product_collection";

export const productsCollectionCopy = buildCollection<Product>({
    id: "products_copied",
    name: "Products copy target",
    path: "products_copied",
    properties,
    Actions: ({ path, collection }: CollectionActionsProps<Product>) =>
        <CopyEntityButton
            pathFrom={"products"}
            collectionFrom={productsCollection}
            pathTo={path}
            collectionTo={collection}
        />
});

```

## Full code

```tsx
import { useCallback } from "react";
import {
    buildCollection,
    buildProperties,
    CollectionActionsProps,
    Entity,
    EntityCollection,
    useDataSource,
    useReferenceDialog,
    useSnackbarController
} from "@firecms/core";
import { Button } from "@firecms/ui";

type Product = {
    name: string;
    price: number;
}

type CopyEntityButtonProps = {
    pathFrom: string;
    pathTo: string;
    collectionFrom: EntityCollection<any>;
    collectionTo: EntityCollection<any>;
};

function CopyEntityButton({
                              pathFrom,
                              collectionFrom,
                              pathTo,
                              collectionTo
                          }: CopyEntityButtonProps) {

    // The datasource allows us to create new documents
    const dataSource = useDataSource();

    // We use a snackbar to indicate success
    const snackbarController = useSnackbarController();

    // We declare a callback function for the reference dialog that will
    // create the new entity and show a snackbar when completed
    const copyEntity = useCallback((entity: Entity<any> | null) => {
        if (entity) {
            dataSource.saveEntity({
                path: pathTo,
                values: entity.values,
                entityId: entity.id,
                collection: collectionTo,
                status: "new"
            }).then(() => {
                snackbarController.open({
                    type: "success",
                    message: "Copied entity " + entity.id
                });
            });
        }
    }, [collectionTo, dataSource, pathTo, snackbarController]);

    // This dialog is used to prompt the selected collection
    const referenceDialog = useReferenceDialog({
        path: pathFrom,
        collection: collectionFrom,
        multiselect: false,
        onSingleEntitySelected: copyEntity
    });

    return (
        <Button onClick={referenceDialog.open}>
            Copy from {pathFrom}
        </Button>
    );
}

// Common properties of our target and source collections
const properties = buildProperties<Product>({
    name: {
        name: "Name",
        validation: { required: true },
        dataType: "string"
    },
    price: {
        name: "Price",
        validation: {
            required: true,
            min: 0
        },
        dataType: "number"
    }
});

// Source collection
export const productsCollection = buildCollection<Product>({
    name: "Products",
    id: "products",
    path: "products",
    properties
});

// Target collection
export const productsCollectionCopy = buildCollection<Product>({
    name: "Products copy target",
    id: "products_copied",
    path: "products_copied",
    properties,
    Actions: ({ path, collection }: CollectionActionsProps<Product>) =>
        <CopyEntityButton
            pathFrom={"products"}
            collectionFrom={productsCollection}
            pathTo={path}
            collectionTo={collection}
        />
});

```

