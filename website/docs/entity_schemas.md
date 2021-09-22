---
id: entity_schemas
title: Entity Schemas
sidebar_label: Entity Schemas
---

The core of the CMS are **entities**, which are defined by an `EntitySchema`. In
the schema you define the properties, which are related to the Firestore data
types.

Check the full API reference in [Entity schemas](api/interfaces/entityschema.md)

- `name` A singular name of the entity as displayed in an Add button. E.g.
  Product

- `description` Description of this entity.

- `customId` When not specified, Firestore will create a random ID. You can set
  the value to `true` to allow the users to choose the ID. You can also pass a
  set of values (as an `EnumValues` object) to allow them to pick from only
  those.

- `properties` Object defining the properties for the entity schema.

### Entity properties

You can specify the properties of an entity, using the following configuration
fields, common to all data types:

* `dataType` Firestore datatype of the property.

* `title` Property title (e.g. Product).

* `description` Property description.

* `longDescription` Longer description of a field, displayed under a popover.

* `columnWidth` Width in pixels of this column in the collection view. If
  not set, the width is inferred based on the other configurations.

* `disabled` Is this a read only property.

* `config`
  You can see more details about how to implement
  [custom fields](custom_fields.md)

    * `field`
      If you need to render a custom field, you can create a component that
      takes `FieldProps` as props. You receive the value, a function to update
      the value and additional utility props such as if there is an error. You
      can customize it by passing custom props that are received in the
      component.

    * `preview`
      Configure how a property is displayed as a preview, e.g. in the collection
      view. You can customize it by passing custom props that are received in
      the component.

    * `customProps`
      Additional props that are passed to the components defined in `field` or
      in `preview`.


* `onPreSave` Hook called before saving, you need to return the values that will
  get saved. If you throw an error in this method the process stops, and an
  error snackbar gets displayed. (example bellow)

* `onSaveSuccess` Hook called when save is successful.

* `onSaveFailure` Hook called when saving fails.

* `onPreDelete` Hook called after the entity is deleted in Firestore. If you throw an error in this method the process stops, and an error snackbar gets displayed.

* `onDelete` Hook called after the entity is deleted in Firestore.

* `defaultValues` Object defining the initial values of the entity on creation.

### Sample entity schema

```tsx
import { buildSchema, EntityReference } from "@camberi/firecms";

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

export const productSchema = buildSchema<Product>({
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
                storageMeta: {
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
