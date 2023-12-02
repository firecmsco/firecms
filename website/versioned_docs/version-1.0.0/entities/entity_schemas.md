---
id: entity_schemas
title: Entity Schemas
sidebar_label: Entity Schemas
---

The core of the CMS are **entities**, which are defined by an `EntitySchema`. In
the schema you define the properties, which are related to the Firestore data
types.

The `name` and `properties` you define for your entity collection, will be used to
generate the fields in the spreadsheet like collection tables, and the fields
in the generated forms.

:::note
FireCMS provides around 15 different fields (such as text fields, selects, and
complex ones like reference or sortable array fields). If your use case is not
covered by one of the provided fields, you can create your own [custom field](custom_fields.md).
:::

Check the full API reference in [Entity schema API]

- `name` A singular name of the entity as displayed in an Add button. E.g.
  Product

- `description` Description of this entity.

- `customId` If this prop is not set, the ID of the document will be created by
  the datasource. You can set the value to 'true' to force the users to choose
  the ID. You can set the value to 'optional' to allow the users to choose the
  ID. If the ID is empty, an automatic ID will be set. You can also pass a set
  of values (as an `EnumValues` object) to allow users to pick from only those.

- `properties` Object defining the properties for the entity schema.

### Sample entity schema

```tsx
import { buildCollection, EntityReference } from "@camberi/firecms";

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

export const productSchema = buildCollection<Product>({
    name: "Product",
    properties: {
        name: {
            dataType: "string",
            title: "Name",
            config: {
                multiline: true
            },
            validation: { required: true }
        },
        main_image: {
            dataType: "string",
            title: "Image",
            config: {
                storage: {
                    mediaType: "image",
                    storagePath: "images",
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000"
                    }
                }
            },
            description: "Upload field for images",
            validation: {
                required: true
            }
        },
        available: {
            dataType: "boolean",
            title: "Available",
            columnWidth: 100
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
        }),
        related_products: {
            dataType: "array",
            title: "Related products",
            description: "Reference to self",
            of: {
                dataType: "reference",
                path: "products"
            }
        },
        publisher: {
            title: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    title: "Name",
                    dataType: "string"
                },
                external_id: {
                    title: "External id",
                    dataType: "string"
                }
            }
        }
    }
});
```
