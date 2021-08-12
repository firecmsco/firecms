---
id: entity_schemas_advanced
title: Entity Schemas Advanced
sidebar_label: Entity Schemas Advanced
---

### Conditional fields from properties

When defining the properties of a schema, you can choose to use a builder
(`PropertyBuilder`), instead of assigning the property configuration directly.
In the builder you receive `PropertyBuilderProps` and return your property.

This is useful for changing property configurations like available values on the
fly, based on other values.

Example of field that gets enabled or disabled based on other values:

```tsx
import { buildSchema } from "@camberi/firecms";

type Product = {
    name: string;
    main_image: string;
    available: boolean;
    price: number;
    related_products: firebase.firestore.DocumentReference[];
    publisher: {
        name: string;
        external_id: string;
    }
}

export const productSchema: EntitySchema = buildSchema<Product>({
    name: "Product",
    properties: {
        available: {
            dataType: "boolean",
            title: "Available"
        },
        price: ({ values }) => ({
            dataType: "number",
            title: "Price",
            validation: {
                requiredMessage: "You must set a price between 0 and 1000",
                min: 0,
                max: 1000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "You can only set the price on available items"
            },
            description: "Price with range validation"
        })
    }
});
```

### Saving callbacks

When you are saving an entity you can attach different callbacks before and
after it gets saved: `onPreSave`, `onSaveSuccess` and `onSaveFailure`.

```tsx
const productSchema = buildSchema({
    customId: true,
    name: "Product",
    onPreSave: ({
                    schema,
                    collectionPath,
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

#### EntitySaveProps

* `schema`: EntitySchema
  Resolved schema of the entity

* `collectionPath`: string
  Full path where this entity is being saved

* `id`?: string
  Id of the entity or undefined if new

* `values`: EntityValues<S, Key>
  Values being saved

* `status`: EntityStatus
  New or existing entity

* `context`: CMSAppContext
  Context of the app status


#### EntityDeleteProps

* `schema`: EntitySchema
  Resolved schema of the entity

* `collectionPath`: string
  Full path where this entity is being saved

* `id`?: string
  Id of the entity or undefined if new

* `entity`: Entity<S, Key>
  Deleted entity

* `context`: CMSAppContext
  Context of the app status

