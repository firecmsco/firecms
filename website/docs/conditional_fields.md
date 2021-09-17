---
id: conditional_fields
title: Conditional fields from properties
sidebar_label: Conditional fields
---

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
    related_products: EntityReference[];
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
