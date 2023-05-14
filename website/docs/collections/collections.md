---
id: collections
title: Collections
sidebar_label: Collections
---

:::tip
You can customize your collections based on the **logged-in user**, by defining 
them using a callback, as described in [Navigation](../navigation).
:::

In FireCMS, **collections** represent groups of entities.

You can find collections at the **top level** of the navigation tree (the
entries displayed in the home page and the navigation drawer), or as **
subcollections**

The `name` and `properties` you define for your entity collection, will be used
to generate the fields in the spreadsheet like collection tables, and the fields
in the generated forms.

:::note
FireCMS provides around 20 different fields (such as text fields,
selects, and complex ones like reference or sortable array fields). If your use
case is not covered by one of the provided fields, you can create your own
[custom field](../properties/custom_fields.md).
:::

You can find collection views as the first level of navigation in the main menu,
or as subcollections inside other collections.

Check the full API reference
in [Entity collections](../api/interfaces/entitycollection)

* `name` The plural name of the collection. E.g. 'Products'.

* `singularName` The singular name of an entry in the collection. E.g. 'Product'.

* `path` Relative Firestore path of this view to its parent. If this view is in
  the root the path, it is equal to the absolute one. This path also determines
  the URL in FireCMS.

* `properties` Object defining the properties for the entity schema.

* `customId` If this prop is not set, the ID of the document will be created by
  the datasource. You can set the value to 'true' to force the users to choose
  the ID. You can set the value to `true` to allow the users to choose the
  ID. You can also pass a set
  of values (as an `EnumValues` object) to allow users to pick from those only.

* `subcollections` Following the Firestore document and collection schema, you
  can add subcollections to your entity in the same way you define the root
  collections.

* `defaultSize` Default size of the rendered collection.

* `group` Optional field used to group top level navigation entries under a
  navigation view. If you set this value in a subcollection, it has no effect.

* `description` Optional description of this view. You can use Markdown.

* `filterCombinations` If you need to filter/sort by multiple properties in this
  collection, you can define the supported filter combinations here.
  In the case of Firestore, you need to create special indexes in the console to
  support filtering/sorting by more than one property. You can then
  specify here the indexes created.

* `initialFilter` Initial filters applied to this collection.
  Defaults to none. Filters applied with this prop can be changed by the user.
  e.g. `initialFilter: { age: [ ">=", 18 ] }`

* `forceFilter` Force a filter in this view. If applied, the rest of the filters
  will be disabled. Filters applied with this prop cannot be changed.
  e.g. `forceFilter: { age: [">=", 18] }`

* `initialSort` Default sort applied to this collection. It takes tuples in the
  shape `["property_name", "asc"]` or `["property_name", "desc"]`

* `Actions` Builder for rendering additional components such as buttons in
  the collection toolbar. The builder takes an object with
  props `entityCollection`  and `selectedEntities` if any are set by the end
  user.

* `pagination` If enabled, content is loaded in batches. If `false` all entities
  in the collection are loaded. You can specify a number to specify the
  pagination size (50 by default)
  Defaults to `true`

* `additionalFields` You can add additional fields to both the collection view,
  and the form view by implementing an additional field delegate.

* `textSearchEnabled` Flag to indicate if a search bar should be displayed on
  top of the collection table. Please note that you need to add

* `permissions` You can specify an object with boolean permissions with the
  shape `{edit:boolean; create:boolean; delete:boolean}` to indicate the actions
  the user can perform. You can also pass
  a [`PermissionsBuilder`](../api/types/permissionsbuilder)
  to customize the permissions based on user or entity.

* `inlineEditing` Can the elements in this collection be edited inline in the
  collection view. If this flag is set to false but `permissions.edit` is `true`
  ,  
  entities can still be edited in the side panel.

* `exportable` Should the data in this collection view include an export button.
  You can also set an [`ExportConfig`](../api/interfaces/exportconfig)
  configuration object to customize the export and add additional values.
  Defaults to `true`

* `hideFromNavigation` Should this collection be hidden from the main navigation
  panel, if
  it is at the root level, or in the entity side panel if it's a
  subcollection.
  It will still be accessible if you reach the specified path.
  You can also use this collection as a reference target.

:::tip
You can force the CMS to always open the form when editing a document by
setting the `inlineEditing` property to `false` in the collection configuration.
:::

### Sample collection

:::tip
You don't need to use `buildCollection` or `buildProperty` for building
the configuration. They are identity functions that will help you detect
type and configuration errors
:::

```tsx
import {
    buildCollection,
    buildProperty,
    EntityReference
} from "firecms";

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

const productsCollection = buildCollection<Product>({
    path: "products",
    name: "Products",
    group: "Main",
    description: "List of the products currently sold in our shop",
    textSearchEnabled: true,
    properties: {
        name: buildProperty({
            dataType: "string",
            name: "Name",
            validation: { required: true }
        }),
        main_image: buildProperty({
            dataType: "string",
            name: "Image",
            storage: {
                mediaType: "image",
                storagePath: "images",
                acceptedFiles: ["image/*"],
                metadata: {
                    cacheControl: "max-age=1000000"
                }
            },
            description: "Upload field for images",
            validation: {
                required: true
            }
        }),
        available: buildProperty({
            dataType: "boolean",
            name: "Available",
            columnWidth: 100
        }),
        price: buildProperty(({ values }) => ({
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
        })),
        related_products: buildProperty({
            dataType: "array",
            name: "Related products",
            description: "Reference to self",
            of: {
                dataType: "reference",
                path: "products"
            }
        }),
        publisher: buildProperty({
            name: "Publisher",
            description: "This is an example of a map property",
            dataType: "map",
            properties: {
                name: {
                    name: "Name",
                    dataType: "string"
                },
                external_id: {
                    name: "External id",
                    dataType: "string"
                }
            }
        })
    },
    // additionalFields: [productAdditionalField], // Example below
    filterCombinations: [{ price: "desc", available: "desc" }],
    permissions: ({ user, authController }) => ({
        edit: true,
        create: true,
        delete: false
    })
});

```

### Additional columns

If you would like to include a column that does not map directly to a property,
you can use the `additionalFields` field, providing a
`AdditionalFieldDelegate`, which includes an id, a title, and a builder that
receives the corresponding entity.

In the builder you can return any React Component.

:::important
If your additional field depends on the value of another property of the entity
you can define the `dependencies` prop as an array of property keys so that
the data is always updated.
This will trigger a rerender whenever there is a change in any of the specified
property values.
:::

#### Example

```tsx
import {
    buildCollection,
    buildCollection,
    AdditionalFieldDelegate
} from "firecms";

type User = { name: string }

export const fullNameAdditionalField: AdditionalFieldDelegate<User> = {
    id: "full_name",
    name: "Full Name",
    builder: ({ entity }) => {
        let values = entity.values;
        return typeof values.name === "string" ? values.name.toUpperCase() : "No name provided";
    },
    dependencies: ["name"]
};

const usersCollection = buildCollection<User>({
    path: "users",
    name: "User",
    properties: {
        name: { dataType: "string", name: "Name" }
    },
    additionalFields: [
        fullNameAdditionalField
    ]
});
```

#### Advanced example

```tsx
import {
    buildCollection,
    AdditionalFieldDelegate,
    AsyncPreviewComponent
} from "firecms";

export const productAdditionalField: AdditionalFieldDelegate<Product> = {
    id: "spanish_title",
    title: "Spanish title",
    builder: ({ entity, context }) =>
        <AsyncPreviewComponent builder={
            context.dataSource.fetchEntity({
                path: entity.path,
                entityId: entity.id,
                collection: localeSchema
            }).then((entity) => entity.values.name)
        }/>
};
```

:::tip
`AsyncPreviewComponent` is a utility component provided by FireCMS that
allows you to render the result of an async computation (such as fetching data
from a subcollection, like in this case). It will display a skeleton loading
indicator in the meantime.
:::

### Subcollections

Subcollections are collections of entities that are found under another entity.
For example, you can have a collection named "translations" under the entity
"Article". You just need to use the same format as for defining your collection
using the field `subcollections`.

Subcollections are easily accessible from the side view while editing an entity.

### Filters

:::tip
If you need to have some filters and sorting applied by default you can use the
`initialFilter` and `initialSort` prop.
You can also force a filter combination to be always applied by using the
`forceFilter` prop.
:::

Filtering is enabled by default for string, numbers, booleans, timestamps and
arrays. A dropdown is included in every column of the collection where
applicable.

Since Firestore has limited querying capabilities, each time to apply a filter
or new sort, the previous sort/filter combination gets reset by default (unless
filtering, sorting by the same property).

If you need to enable filtering/sorting by more than one property at a time, you
can specify the filters that you have enabled in your Firestore configuration.
In order to do so, just pass the indexes configuration to your collection:

```tsx
import { buildCollection } from "firecms";

const productsCollection = buildCollection<Product>({
    path: "products",
    name: "Product",
    properties: {
        // ...
    },
    indexes: [
        {
            price: "asc",
            available: "desc"
        }
    ]
});
```
