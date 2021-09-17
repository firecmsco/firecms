---
id: saving_callbacks
title: Saving and deleting callbacks
sidebar_label: Saving and deleting callbacks
---

When you are saving an entity you can attach different callbacks before and
after it gets saved: `onPreSave`, `onSaveSuccess` and `onSaveFailure`.

This is useful if you need to add some logic or edit some fields before/after
saving or deleting entities.

:::note
You can stop the execution of these callbacks by throwing an `Error`
containing a `string` and an error snackbar will be displayed.
:::

```tsx
const productSchema = buildSchema({

    name: "Product",

    onPreSave: ({
                    schema,
                    path,
                    id,
                    values,
                    status
                }) => {
        values.uppercase_name = values.name.toUpperCase();
        return values;
    },

    onSaveSuccess: (props: EntitySaveProps<Product>) => {
        console.log("onSaveSuccess", props);
    },

    onSaveFailure: (props: EntitySaveProps<Product>) => {
        console.log("onSaveFailure", props);
    },

    onPreDelete: ({
                      schema,
                      path,
                      entityId,
                      entity,
                      context,
                  }: EntityDeleteProps<Product>
    ) => {
        if(context.authController.user)
        throw Error("Product deletion not allowed");
    },

    onDelete: (props: EntityDeleteProps<Product>) => {
        console.log("onDelete", props);
    },

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
        },
    }
});
```

#### EntityOnSaveProps

* `schema`: EntitySchema Resolved schema of the entity

* `path`: string Full path where this entity is being saved

* `entityId`?: string Id of the entity or undefined if new

* `values`: EntityValues<S, Key>
  Values being saved

* `status`: EntityStatus New or existing entity

* `context`: CMSAppContext Context of the app status

#### EntityOnDeleteProps

* `schema`: EntitySchema Resolved schema of the entity

* `path`: string Full path where this entity is being saved

* `entityId`?: string Id of the entity or undefined if new

* `entity`: Entity<S, Key>
  Deleted entity

* `context`: CMSAppContext Context of the app status

