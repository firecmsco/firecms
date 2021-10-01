---
id: collections
title: Collections
sidebar_label: Collections
---

In FireCMS, collections represent groups of entities. Collections need to be
associated with an entity schema. You can find collections
at the **top level** of the navigation tree (the entries displayed in the home
page and the navigation drawer), or as **subcollections**

Once you have defined at least one entity schema, you can include it in a
**collection**. You can find collection views as the first level of navigation in
the main menu, or as subcollections inside other collections, following the
Firestore data schema.

Check the full API reference
in [Entity collections](../api/interfaces/entitycollection.md)

* `name` The plural name of the view. E.g. 'products'.

* `path` Relative Firestore path of this view to its parent. If this
  view is in the root the path, it is equal to the absolute one. This path also
  determines the URL in FireCMS.

* `subcollections` Following the Firestore document and collection schema, you
  can add subcollections to your entity in the same way you define the root
  collections.

* `defaultSize` Default size of the rendered collection.

* `group` Optional field used to group top level navigation entries under a
  navigation view. If you set this value in a subcollection, it has no effect.

* `description` Optional description of this view. You can use Markdown.

* `properties` Properties displayed in this collection. If this prop is not
  set, every property is displayed.

* `excludedProperties` Properties that should **not** get displayed in the
  collection view. All the other properties from the entity are displayed. It
  has no effect if the `properties` value is set.

* `filterCombinations` If you need to filter/sort by multiple properties in this
  collection, you can define the supported filter combinations here.
  In the case of Firestore, you need to create special indexes in the console to
  support filtering/sorting by more than one property. You can then
  specify here the indexes created.

* `initialFilter` Initial filters applied to this collection.

* `initialSort` Default sort applied to this collection. It takes tuples in the
  shape `["property_name", "asc"]` or `["property_name", "desc"]`

* `extraActions` Builder for rendering additional components such as buttons in
  the collection toolbar. The builder takes an object with
  props `entityCollection`  and `selectedEntities` if any are set by the end
  user.

* `pagination` If enabled, content is loaded in batches. If `false` all entities
  in the collection are loaded. You can specify a number to specify the
  pagination size (50 by default)
  Defaults to `true`

* `additionalColumns` You can add additional columns to the collection view by
  implementing an additional column delegate.

* `textSearchEnabled` Flag to indicate if a search bar should be displayed on top of
  the collection table.

* `permissions` You can specify an object with boolean permissions with the
  shape `{edit:boolean; create:boolean; delete:boolean}` to indicate the actions
  the user can perform. You can also pass a [`PermissionsBuilder`](../api/types/permissionsbuilder.md)
  to customize the permissions based on user or entity.

* `inlineEditing` Can the elements in this collection be edited inline in the
  collection view. If this flag is set to false but `permissions.edit` is `true`
  , entities can still be edited in the side panel.

* `exportable` Should the data in this collection view include an export button.
  You can also set an [`ExportConfig`](../api/interfaces/exportconfig.md)
  configuration object to customize the export and add additional values.
  Defaults to `true`

:::note
In the examples you might see references to the type `Product`
(which defines the model) or the schema `productSchema`, as declared in
the [entity schemas section](../entities/entity_schemas.md)
:::

### Sample collection

```tsx
import { buildCollection } from "dist/index";

const productsCollection = buildCollection<Product>({
    path: "products",
    schema: productSchema,
    name: "Products",
    group: "Main",
    description: "List of the products currently sold in our shop",
    textSearchEnabled: true,
    additionalColumns: [productAdditionalColumn],
    filterCombinations: [{ price: "desc", available: "desc" }],
    permissions: ({ user, authController }) => ({
        edit: true,
        create: true,
        delete: false
    }),
    excludedProperties: ["related_products"]
});

```

### Additional columns

If you would like to include a column that does not map directly to a property,
you can use the `additionalColumns` field, providing a
`AdditionalColumnDelegate`, which includes an id, a title, and a builder that
receives the corresponding entity.

In the builder you can return any React Component.

If you would like to do some async computation, such as fetching a different
entity, you can use the utility component `AsyncPreviewComponent` to show a
loading indicator.

```tsx
import { buildCollection, AdditionalColumnDelegate, AsyncPreviewComponent } from "@camberi/firecms";

export const productAdditionalColumn: AdditionalColumnDelegate<Product> = {
    id: "spanish_title",
    title: "Spanish title",
    builder: (entity: Entity<Product>) =>
        <AsyncPreviewComponent builder={
            entity.reference.collection("locales")
                .doc("es")
                .get()
                .then((snapshot: any) => snapshot.get("name") as string)
        }/>
};
```

### Subcollections

Subcollections are collections of entities that are found under another entity.
For example, you can have a collection named "translations" under the entity
"Article". You just need to use the same format as for defining your collection
using the field `subcollections`.

Subcollections are easily accessible from the side view while editing an entity.

### Filters

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
import { buildCollection } from "@camberi/firecms";

const productsCollection = buildCollection<Product>({
    path: "products",
    schema: productSchema,
    name: "Products",
    indexes: [
        {
            price: "asc",
            available: "desc"
        }
    ]
});
```
