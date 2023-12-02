---
id: conditional_fields
title: Conditional fields from properties
sidebar_label: Conditional fields
---

When defining the properties of a collection, you can choose to use a builder
[`PropertyBuilder`], instead of assigning the
property configuration directly. In the builder you
receive [`PropertyBuilderProps`]
and return your property.

This is useful for changing property configurations like available values on the
fly, based on other values.

### Example 1

Example of field that gets enabled or disabled based on other values:

```tsx
import { buildCollection, EntityReference, EntitySchema } from "@camberi/firecms";

type Product = {
    name: string;
    main_image: string;
    available: boolean;
    price: number;
    related_products: EntityReference[];
    publisher: {
        name: string;
        external_id: string;
    }
}

export const productSchema: EntitySchema = buildCollection<Partial<Product>>({
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

### Example 2:

A `User` type that has a `source` field that can be of type `facebook`
or `apple`, and its fields change accordingly

```tsx
import {
    buildCollection,
    EntitySchema,
    buildProperty,
    buildProperties
} from "@camberi/firecms";

type User = {
    source: {
        type: "facebook",
        facebookId: string
    } | {
        type: "apple",
        appleId: number
    }
}

export const userSchema: EntitySchema = buildCollection<User>({
    name: "User",
    properties: {
        source: ({ values }) => {
            const properties = buildProperties<any>({
                type: {
                    dataType: "string",
                    config: {
                        enumValues: {
                            "facebook": "FacebookId",
                            "apple": "Apple"
                        }
                    }
                }
            });

            if (values.source) {
                if ((values.source as any).type === "facebook") {
                    properties["facebookId"] = buildProperty({
                        dataType: "string"
                    });
                } else if ((values.source as any).type === "apple") {
                    properties["appleId"] = buildProperty({
                        dataType: "number"
                    });
                }
            }

            return ({
                dataType: "map",
                title: "Source",
                properties: properties
            });
        }
    }
});

```
