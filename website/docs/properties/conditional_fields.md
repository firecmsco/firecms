---
id: conditional_fields
title: Conditional fields from properties
sidebar_label: Conditional fields
description: In FireCMS, conditional fields allow for dynamic property configurations within your collection schemas, offering responsive interfaces that adapt to other property values in real time. The `PropertyBuilder` function enables you to construct properties whose attributes, such as enabled or disabled states, are determined by the values of other fields in the entity. This is particularly useful when you want to create intuitive forms that change based on user input or data context, ensuring a seamless content management experience. Whether you're working with boolean toggles or conditional property types like in user authentication sources, FireCMS's conditional fields are essential tools for building flexible and user-responsive CMS platforms.
---

When defining the properties of a collection, you can choose to use a builder
[`PropertyBuilder`](../api/type-aliases/PermissionsBuilder), instead of assigning the
property configuration directly. 

This is useful for changing property configurations like available values on the
fly, based on other values.

:::tip
You can use property builders at any level of your property tree
(including children of maps an arrays).

You can access the complete values of the entity being edited in the builder
with the `values` prop, but also the value of the property being built with
`propertyValue`.
:::

### Example 1

Example of field that gets enabled or disabled based on other values:

```tsx
import {
    buildCollection,
    EntityCollection,
    EntityReference
} from "@firecms/core";

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

export const productCollection: EntityCollection = buildCollection<Partial<Product>>({
    name: "Product",
    properties: {
        available: {
            dataType: "boolean",
            name: "Available"
        },
        price: ({ values }) => ({
            dataType: "number",
            name: "Price",
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

### Example 2

A `User` type that has a `source` field that can be of type `facebook`
or `apple`, and its fields change accordingly

```tsx
import {
    buildCollection,
    EntityCollection,
    buildProperty,
    buildProperties
} from "@firecms/core";

type User = {
    source: {
        type: "facebook",
        facebookId: string
    } | {
        type: "apple",
        appleId: number
    }
}

export const userSchema: EntityCollection = buildCollection<User>({
    name: "User",
    properties: {
        source: ({ values }) => {
            const properties = buildProperties({
                type: {
                    dataType: "string",
                    enum: {
                        "facebook": "FacebookId",
                        "apple": "Apple"
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
                name: "Source",
                properties: properties
            });
        }
    }
});
```
