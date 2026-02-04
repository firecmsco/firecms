---
slug: docs/collections/index
title: Collections
sidebar_label: Collections
description: Define your Firestore data schema with FireCMS collections. Build type-safe admin panels for Firebase with React and TypeScript.
---

**Collections** are the core building blocks of your FireCMS **admin panel**. They define how your **Firestore data** is displayed, edited, and managed in the CMS interface.

If you're building a **headless CMS** or **back-office** for your **Firebase** project, collections are where you define:
- **What data** users can manage (products, users, articles, orders, etc.)
- **How that data looks** in forms and tables (field types, validation, layout)
- **Who can do what** (create, read, update, delete permissions)
- **Custom logic** (callbacks on save, computed fields, side effects)

:::tip Why use FireCMS collections?
Unlike traditional CMSs that impose a rigid data model, FireCMS collections map directly to your existing **Firestore** structure. This means you can add a powerful **React-based admin UI** to any Firebase project without migrating your data or changing your schema.
:::

Collections appear at the **top level** of the navigation (home page and drawer), or as **subcollections** nested under parent entities.

You can define collections in two ways:
- **No-code**: Use the built-in **Collection Editor UI** (requires appropriate permissions)
- **Code-first**: Define collections programmatically with full **TypeScript** support and access to all advanced features (callbacks, custom fields, computed properties)

## Defining your collections

You can create your collections **in the UI or using code**. You can also mix both approaches, but keep in mind that
collections defined in the UI will take precedence. For example, you might have an enum property with 2 values defined
in code, and one extra value defined in the UI. When merged, the resulting enum will have 3 values.

:::important
You can have the same collection defined in both ways. In that case, the collection defined in the UI will
take precedence.

A deep merge is performed, so you can define some properties in the code, and override them in the UI. For example, you
can define an enum string property and the values will be merged from both definitions.
:::

### Sample collection defined in code

:::note
FireCMS provides around 20 different fields (such as text fields, selects, and complex ones like reference or
sortable array fields). If your use case is not covered by one of the provided fields, you can create your
own [custom field](../properties/custom_fields.mdx).
:::

:::tip
You don't need to use `buildCollection` or `buildProperty` for building the configuration. They are identity
functions that will help you detect type and configuration errors
:::

```tsx
import { buildCollection, buildProperty, EntityReference } from "@firecms/core";

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
  id: "products",
  path: "products",
  name: "Products",
  group: "Main",
  description: "List of the products currently sold in our shop",
  textSearchEnabled: true,
  openEntityMode: "side_panel",
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
  permissions: ({
                  user,
                  authController
                }) => ({
    edit: true,
    create: true,
    delete: false
  })
});
```

In FireCMS Cloud, this collection can then be used by including it in the `collections` prop of your main export,
a `FireCMSAppConfig`
object.

In FireCMS PRO, `collections` are passed directly to the `useBuildNavigationController` hook.

### Modifying a collection defined in the UI

If you just need to add some code to a collection defined in the UI, you can use the `modifyCollection` function in
your `FireCMSAppConfig` object.

This applies to **FireCMS Cloud** only.

```tsx
import { FireCMSAppConfig } from "@firecms/core";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... full-code defined collections here
        ]);
    },
    modifyCollection: ({ collection }) => {
        if (collection.id === "products") {
            return {
                ...collection,
                name: "Products modified",
                entityActions: [
                    {
                        name: "Sample entity action",
                        onClick: ({ entity }) => {
                            console.log("Entity", entity);
                        }
                    }
                ]
            }
        }
        return collection;
    }
}

export default appConfig;
```

You can use all the props available in the `Collection` interface.

## Subcollections

Subcollections are collections of entities that are found under another entity. For example, you can have a collection
named "translations" under the entity "Article". You just need to use the same format as for defining your collection
using the field `subcollections`.

Subcollections are easily accessible from the side view while editing an entity.

## Filters

:::tip
If you need to have some filters and sorting applied by default, you can use the `filter`and `sort`
prop. You can also force a filter combination to be always applied by using the `forceFilter`prop.
:::

Filtering is enabled by default for string, numbers, booleans, dates, and arrays. A dropdown is included in every
column of the collection where applicable.

Since Firestore has limited querying capabilities, each time you apply a filter or new sort, the previous sort/filter
combination gets reset by default (unless filtering, sorting by the same property).

If you need to enable filtering/sorting by more than one property at a time, you can specify the filters that you have
enabled in your Firestore configuration. In order to do so, just pass the indexes configuration to your collection:

```tsx
import { buildCollection } from "@firecms/core";

const productsCollection = buildCollection<Product>({
    id: "products",
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

## Collection configuration

The `name` and `properties` you define for your entity collection will be used to generate the fields in the
spreadsheet-like collection tables, and the fields in the generated forms.

:::tip
You can force the CMS to always open the form when editing a document by setting the `inlineEditing` property
to `false` in the collection configuration.
:::

- **`name`**: The plural name of the collection. E.g., 'Products'.
- **`singularName`**: The singular name of an entry in the collection. E.g., 'Product'.
- **`path`**: Relative Firestore path of this view to its parent. If this view is in the root, the path is equal to the
  absolute one. This path also determines the URL in FireCMS.
- **`properties`**: Object defining the properties for the entity schema. More information
  in [Properties](../properties/properties_intro).
- **`propertiesOrder`**: Order in which the properties are displayed.
    - For properties, use the property key.
    - For additional field, use the field key.
    - If you have subcollections, you get a column for each subcollection, with the path (or alias) as the
      subcollection, prefixed with `subcollection:`. E.g., `subcollection:orders`.
    - If you are using a collection group, you will also have an additional `collectionGroupParent` column.
    - Note that if you set this prop, other ways to hide fields, like `hidden` in the property definition, will be
      ignored. `propertiesOrder` has precedence over `hidden`.

  ```typescript
  propertiesOrder: ["name", "price", "subcollection:orders"]
  ```

- **`openEntityMode`**: Determines how the entity view is opened. You can choose between `side_panel` (default) or
  `full_screen`.
- **`formAutoSave`**: If set to true, the form will be auto-saved when the user changes the value of a field. Defaults
  to false. You can't use this prop if you are using a `customId`.
- **`collectionGroup`**: If this collection is a top-level navigation entry, you can set this property to `true` to
  indicate that this collection is a collection group.
- **`alias`**: You can set an alias that will be used internally instead of the `path`. The `alias` value will be used
  to determine the URL of the collection while `path` will still be used in the datasource. Note that you can use this
  value in reference properties too.
- **`icon`**: Icon key to use in this collection. You can use any of the icons in the Material
  specs: [Material Icons](https://fonts.google.com/icons). e.g., 'account_tree' or 'person'.
  Find all the icons in [Icons](https://firecms.co/docs/icons).
  You can also pass your own icon component (`React.ReactNode`).
- **`customId`**: If this prop is not set, the ID of the document will be created by the datasource. You can set the
  value to 'true' to force the users to choose the ID.
- **`subcollections`**: Following the Firestore document and collection schema, you can add subcollections to your
  entity in the same way you define the root collections.
- **`defaultSize`**: Default size of the rendered collection.
- **`group`**: Optional field used to group top-level navigation entries under a navigation view. If you set this value
  in a subcollection, it has no effect.
- **`description`**: Optional description of this view. You can use Markdown.
- **`entityActions`**: You can define additional actions that can be performed on the entities in this collection. These
  actions can be displayed in the collection view or in the entity view. You can use the `onClick` method to implement
  your own logic. In the `context` prop, you can access all the controllers of FireCMS.
  You can also define entity actions globally. See [Entity Actions](./entity_actions) for more details.

```tsx
const archiveEntityAction: EntityAction = {
    icon: <ArchiveIcon/>,
    name: "Archive",
    onClick({
                entity,
                collection,
                context
            }): Promise<void> {
        // Add your code here
        return Promise.resolve(undefined);
    }
}
```

- **`filter`**: Initial filters applied to this collection. Defaults to none. Filters applied with this prop can
  be changed by the user.

```tsx
filter: {
    age: [">=", 18]
}
```
```tsx
filter: {
    related_user: ["==", new EntityReference("sdc43dsw2", "users")]
}
```

- **`forceFilter`**: Force a filter in this view. If applied, the rest of the filters will be disabled. Filters applied
  with this prop cannot be changed.

```tsx
forceFilter: {
    age: [">=", 18]
}
```
```tsx
forceFilter: {
    related_user: ["==", new EntityReference("sdc43dsw2", "users")]
}
```

- **`sort`**: Default sort applied to this collection. It takes tuples in the shape `["property_name", "asc"]`
  or `["property_name", "desc"]`.

```tsx
sort: ["price", "asc"]
```

- **`Actions`**: Builder for rendering additional components such as buttons in the collection toolbar. The builder
  takes an object with props `entityCollection` and `selectedEntities` if any are set by the end user.
- **`pagination`**: If enabled, content is loaded in batches. If `false` all entities in the
  collection are loaded. This means that when reaching the end of the collection, the CMS will load more entities.
  You can specify a number to specify the pagination size (50 by default)
  Defaults to `true`
- **`additionalFields`**: You can add additional fields to both the collection view and the form view by implementing an
  additional field delegate.
- **`textSearchEnabled`**: Flag to indicate if a search bar should be displayed on top of the collection table.
- **`permissions`**: You can specify an object with boolean permissions with the
  shape `{edit:boolean; create:boolean; delete:boolean}` to indicate the actions the user can perform. You can also pass
  a [`PermissionsBuilder`](../api/type-aliases/PermissionsBuilder) to customize the permissions based on the user or entity.
- **`inlineEditing`**: Can the elements in this collection be edited inline in the collection view? If this flag is set
  to false but `permissions.edit` is `true`, entities can still be edited in the side panel.
- **`selectionEnabled`**: Are the entities in this collection selectable? Defaults to `true`.
- **`selectionController`**: Pass your own selection controller if you want to control selected entities
  externally. [See `useSelectionController`](../api/functions/useSelectionController).
- **`exportable`**: Should the data in this collection view include an export button? You can also set
  an [`ExportConfig`](../api/interfaces/ExportConfig) configuration object to customize the export and add additional
  values. Defaults to `true`.
- **`hideFromNavigation`**: Should this collection be hidden from the main navigation panel if it is at the root level,
  or in the entity side panel if it's a subcollection? It will still be accessible if you reach the specified path. You
  can also use this collection as a reference target.
- **`callbacks`**: This interface defines all the callbacks that can be used when an entity is being created, updated,
  or deleted. Useful for adding your own logic or blocking the operation's execution. [More information](./callbacks).
- **`entityViews`**: Array of builders for rendering additional panels in an entity view. Useful if you need to render custom
  views for your entities. [More information](./collections/entity_views).
- **`alwaysApplyDefaultValues`**: If set to true, the default values of the properties will be applied
  to the entity every time the entity is updated (not only when created).
  Defaults to false.
- **`databaseId`**: Optional database id of this collection. If not specified, the default database id will be used.
  Useful when working with multiple databases.
- **`previewProperties`**: Default preview properties displayed when this collection is referenced.
- **`titleProperty`**: Title property of the entity. This property will be used as the title in entity views and
  references. If not specified, the first simple text property will be used.
- **`defaultSelectedView`**: If you want to open custom views or subcollections by default when opening an entity,
  specify the path here. Can be a string or a builder function.
- **`hideIdFromForm`**: Should the ID of this collection be hidden from the form view.
- **`hideIdFromCollection`**: Should the ID of this collection be hidden from the grid view.
- **`sideDialogWidth`**: Width of the side dialog (in pixels or string) when opening an entity in this collection.
- **`editable`**: Can this collection configuration be edited by the end user. Defaults to `true`.
  Has effect only if you are using the collection editor.
- **`includeJsonView`**: If set to true, a tab with the JSON representation of the entity will be included.
- **`history`**: If set to true, changes to the entity will be saved in a subcollection.
  This prop has no effect if the history plugin is not enabled.
- **`localChangesBackup`**: Should local changes be backed up in local storage to prevent data loss.
  Options: `"manual_apply"` (prompt to restore), `"auto_apply"` (automatically restore), or `false`. Defaults to `"manual_apply"`.
- **`defaultViewMode`**: Default view mode for displaying this collection.
  Options: `"table"` (spreadsheet-like, default), `"cards"` (grid of cards with thumbnails), `"kanban"` (board grouped by property).
- **`kanban`**: Configuration for Kanban board view mode. Requires a `columnProperty` referencing an enum property.
  When set, the Kanban view mode becomes available.
  
```tsx
kanban: {
    columnProperty: "status" // Must reference a string property with enumValues
}
```

- **`orderProperty`**: Property key to use for ordering items. Must reference a number property.
  When items are reordered, this property will be updated to reflect the new order using fractional indexing.
  Used by Kanban view for ordering within columns.
