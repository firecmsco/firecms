---
id: saving_callbacks
title: Saving and deleting callbacks
sidebar_label: Saving and deleting callbacks
---

When you are saving an entity you can attach different callbacks before and
after it gets saved: `onPreSave`, `onSaveSuccess` and `onSaveFailure`.

These callbacks are defined at the collection level under the prop `callbacks`.

This is useful if you need to add some logic or edit some fields before/after
saving or deleting entities.

All callbacks are asynchronous.

:::note
You can stop the execution of these callbacks by throwing an `Error`
containing a `string` and an error snackbar will be displayed.
:::

```tsx
import React from "react";

import {
    buildSchema,
    EntityOnDeleteProps,
    EntityOnSaveProps
} from "@camberi/firecms";

type Product = {
    name: string;
    uppercase_name: string;
}

const productSchema = buildSchema<Product>({

    name: "Product",
    properties: {
        name: {
            title: "Name",
            validation: { required: true },
            dataType: "string"
        },
        uppercase_name: {
            title: "Uppercase Name",
            dataType: "string",
            disabled: true,
            description: "This field gets updated with a preSave callback"
        }
    }
});

const productCallbacks = buildEntityCallbacks({
    onPreSave: ({
                    schema,
                    path,
                    entityId,
                    values,
                    status
                }) => {
        values.uppercase_name = values.name?.toUpperCase();
        return values;
    },

    onSaveSuccess: (props: EntityOnSaveProps<Product>) => {
        console.log("onSaveSuccess", props);
    },

    onSaveFailure: (props: EntityOnSaveProps<Product>) => {
        console.log("onSaveFailure", props);
    },

    onPreDelete: ({
                      schema,
                      path,
                      entityId,
                      entity,
                      context
                  }: EntityOnDeleteProps<Product>
    ) => {
        if (context.authController.user)
            throw Error("Product deletion not allowed");
    },

    onDelete: (props: EntityOnDeleteProps<Product>) => {
        console.log("onDelete", props);
    },
});
```

#### EntityOnSaveProps

* `schema`: EntitySchema Resolved schema of the entity

* `path`: string Full path where this entity is being saved

* `entityId`?: string Id of the entity or undefined if new

* `values`: EntityValues Values being saved

* `status`: EntityStatus New or existing entity

* `context`: FireCMSContext Context of the app status

#### EntityOnDeleteProps

* `schema`: EntitySchema Resolved schema of the entity

* `path`: string Full path where this entity is being saved

* `entityId`?: string Id of the entity or undefined if new

* `entity`: Entity Deleted entity

* `context`: FireCMSContext Context of the app status

