---
slug: docs/collections/callbacks
title: Entity callbacks
sidebar_label: Entity callbacks
---

When working with an entity, you can attach different callbacks before and
after it gets saved or fetched:
`afterRead`, `onIdUpdate`, `beforeSave`, `afterSave` and `afterSaveError`.

These callbacks are defined at the collection level under the prop `callbacks`.

The `onIdUpdate` callback can be used to update the ID of the entity before
saving it. This is useful if you need to generate the ID from other fields.

This is useful if you need to add some logic or edit some fields or the entity
IF before/after saving or deleting entities.

Most callbacks are asynchronous.

:::note
You can stop the execution of these callbacks by throwing an `Error`
containing a `string` and an error snackbar will be displayed.
:::

:::tip
You can use the `context` object to access the FireCMS context.
The `context` object contains all the controllers and services available in the app,
including the `authController`, `dataSource`, `storageSource`, `sideDialogsController`, etc.
:::

```tsx
import {
    buildCollection,
    buildEntityCallbacks,
    EntityBeforeDeleteProps,
    EntityAfterSaveProps,
    EntityAfterReadProps,
    EntityIdUpdateProps,
    toSnakeCase
} from "@firecms/core";

type Product = {
    name: string;
    uppercase_name: string;
}

const productCallbacks = buildEntityCallbacks({
    beforeSave: ({
                    collection,
                    path,
                    entityId,
                    values,
                    previousValues,
                    status
                }) => {
        // return the updated values
        values.uppercase_name = values.name?.toUpperCase();
        return values;
    },

    afterSave: (props: EntityAfterSaveProps<Product>) => {
        console.log("afterSave", props);
    },

    afterSaveError: (props: EntityAfterSaveProps<Product>) => {
        console.log("afterSaveError", props);
    },

    beforeDelete: ({
                      collection,
                      path,
                      entityId,
                      entity,
                      context
                  }: EntityBeforeDeleteProps<Product>
    ) => {
        if (!context.authController.user)
            throw Error("Not logged in users cannot delete products");
    },

    onDelete: (props: EntityBeforeDeleteProps<Product>) => {
        console.log("onDelete", props);
    },

    afterRead({
                collection,
                context,
                entity,
                path,
            }: EntityAfterReadProps) {
        entity.values.name = "Forced name";
        return entity;
    },

    onIdUpdate({
                   collection,
                   context,
                   entityId,
                   path,
                   values
               }: EntityIdUpdateProps): string {
        // return the desired ID
        return toSnakeCase(values?.name)
    },
});

const productCollection = buildCollection<Product>({
    name: "Product",
    path: "products",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        uppercase_name: {
            name: "Uppercase Name",
            dataType: "string",
            disabled: true,
            description: "This field gets updated with a preSave callback"
        }
    },
    callbacks: productCallbacks
});
```

#### EntityAfterSaveProps

* `collection`: Resolved collection of the entity

* `path`: string Full path where this entity is being saved (may contain unresolved aliases)

* `resolvedPath`: string Full path with alias resolved

* `entityId`: string ID of the entity

* `values`: EntityValues Values being saved

* `previousValues`: EntityValues Previous values of the entity

* `status`: EntityStatus New or existing entity

* `context`: FireCMSContext Context of the app status

#### EntityBeforeDeleteProps

* `collection`:  Resolved collection of the entity

* `path`: string Full path where this entity is being saved

* `entityId`: string ID of the entity

* `entity`: Entity Deleted entity

* `context`: FireCMSContext Context of the app status

#### EntityIdUpdateProps

* `collection`: EntityCollection Resolved collection of the entity

* `path`: string Full path where this entity is being saved

* `entityId`: string ID of the entity

* `values`: Entity values

* `context`: FireCMSContext Context of the app status
