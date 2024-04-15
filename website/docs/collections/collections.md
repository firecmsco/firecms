---
id: collections
title: Collections
sidebar_label: Collections
description: Discover how FireCMS Collections can streamline your data organization and management. Including features like top-level grouping and subcollections, define collections using UI or code, and implement advanced customizations, filtering, and permissions for optimized control over your CMS. Explore how to define, modify, and extend collections through intuitive UI interactions or detailed code customizations. Leverage FireCMS's robust entity and subcollection framework, with powerful filtering and sorting capabilities, for a seamless administrative experience. Learn more about collection configurations, entity actions, and inline editing options tailored to your needs. Whether you're managing products, articles, or custom data types, FireCMS Collections are the backbone of your efficient, scalable content management system.
---

In FireCMS, **collections** represent groups of entities.

You can find collections at the **top level** of the navigation tree (the entries displayed in the home page and the
navigation drawer), or as **subcollections**.

Collections in FireCMS can be defined in two ways:

- Using the **FireCMS Cloud UI**.
- Using **code**.

If the logged-in user has the required permissions, they will be able to create collections using the UI. Collections
defined by the UI hae some limitations, such as not being able to define any callbacks.

On the other hand, if you are using code, you can define your collections programmatically, and you can use all the
features of FireCMS.

### Defining your collections

You can create your collections **in the UI or using code**. You can also mix both approaches, but keep in mind that
collections defined in the UI will take precedence. For example, you might have an enum property with 2 values defined
in code, and one extra value defined in the UI. When merged, the resulting enum will have 3 values.

:::important
You can have the same collection defined in both ways. In that case, the collection defined in the UI will
take precedence.

A deep merge is performed, so you can define some properties in the code, and override them in the UI. For example, you
can define an enum string property and the values will be merged from both definitions.
:::

#### Modifying a collection defined in the UI

If you just need to add some code to a collection defined in the UI, you can use the `modifyCollection` function in
your `FireCMSAppConfig` object.

```tsx
import { FireCMSAppConfig } from "@firecms/cloud";

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

#### Sample collection defined in code

:::note
FireCMS provides around 20 different fields (such as text fields, selects, and complex ones like reference or
sortable array fields). If your use case is not covered by one of the provided fields, you can create your
own [custom field](../properties/custom_fields.md).
:::

:::tip
You don't need to use `buildCollection` or `buildProperty` for building the configuration. They are identity
functions that will help you detect type and configuration errors
:::

```tsx
import {
    buildCollection,
    buildProperty,
    EntityReference
} from "@firecms/cloud";

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
    filterCombinations: [{
        price: "desc",
        available: "desc"
    }],
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

This collection can then be used by including it in the `collections` prop of your main export, a `FireCMSAppConfig`
object.

### Subcollections

Subcollections are collections of entities that are found under another entity. For example, you can have a collection
named "translations" under the entity "Article". You just need to use the same format as for defining your collection
using the field `subcollections`.

Subcollections are easily accessible from the side view while editing an entity.

### Filters

:::tip
If you need to have some filters and sorting applied by default, you can use the `initialFilter`and `initialSort`
prop. You can also force a filter combination to be always applied by using the `forceFilter`prop.
:::

Filtering is enabled by default for string, numbers, booleans, dates, and arrays. A dropdown is included in every
column of the collection where applicable.

Since Firestore has limited querying capabilities, each time you apply a filter or new sort, the previous sort/filter
combination gets reset by default (unless filtering, sorting by the same property).

If you need to enable filtering/sorting by more than one property at a time, you can specify the filters that you have
enabled in your Firestore configuration. In order to do so, just pass the indexes configuration to your collection:

```tsx
import { buildCollection } from "@firecms/cloud";

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

### Collection configuration

The `name` and `properties` you define for your entity collection will be used to generate the fields in the
spreadsheet-like collection tables, and the fields in the generated forms.

:::tip 
You can force the CMS to always open the form when editing a document by setting the `inlineEditing` property
to `false` in the collection configuration.
:::

- `name`: The plural name of the collection. E.g. 'Products'.

- `singularName`: The singular name of an entry in the collection. E.g. 'Product'.

- `path`: Relative Firestore path of this view to its parent. If this view is in the root, the path is equal to the
  absolute one. This path also determines the URL in FireCMS.

- `properties`: Object defining the properties for the entity schema. More information
  in [Properties](../properties/properties_intro.md).

- `propertiesOrder`: Order in which the properties are displayed.
    - For properties, use the property key.
    - For additional columns use the column id.
    - If you have subcollections, you get a column for each subcollection, with the path (or alias) as the
      subcollection, prefixed with `subcollection:`. E.g., `subcollection:orders`.
    - If you are using a collection group, you will also have an additional `collectionGroupParent` column.
  You can use this prop to hide some properties from the table view.
  Note that if you set this prop, other ways to hide fields, like
  `hidden` in the property definition,will be ignored.
  `propertiesOrder` has precedence over `hidden`.
  
- `formAutoSave`: If set to true, the form will be auto-saved when the user changes the value of a field. Defaults to
  false. You can't use this prop if you are using a `customId`.

- `collectionGroup`: If this collection is a top-level navigation entry, you can set this property to `true` to indicate
  that this collection is a collection group.

- `alias`: You can set an alias that will be used internally instead of the `path`. The `alias` value will be used to
  determine the URL of the collection while `path` will still be used in the datasource. Note that you can use this
  value in reference properties too.

- `icon`: Icon key to use in this collection. You can use any of the icons in the Material
  specs: https://fonts.google.com/icons e.g., 'account_tree' or 'person'.

- `customId`: If this prop is not set, the ID of the document will be created by the datasource. You can set the value
  to 'true' to force the users to choose the ID.

- `subcollections`: Following the Firestore document and collection schema, you can add subcollections to your entity in
  the same way you define the root collections.

- `defaultSize`: Default size of the rendered collection.

- `group`: Optional field used to group top-level navigation entries under a navigation view. If you set this value in a
  subcollection, it has no effect.

- `description`: Optional description of this view. You can use Markdown.

- `entityActions`: EntityAction[];
  You can define additional actions that can be performed on the entities in this collection. These actions can be
  displayed in the collection view or in the entity view.
  You can use the `onClick` method to implement your own logic. In the `context` prop, you can access all the
  controllers of FireCMS.
    ```
    const archiveEntityAction: EntityAction = {
        icon: <ArchiveIcon/>,
        name: "Archive",
        onClick({
                    entity,
                    collection,
                    context,
                }): Promise<void> {
            // Add your code here
            return Promise.resolve(undefined);
        }
    }
    ```

- `filterCombinations`: If you need to filter/sort by multiple properties in this collection, you can define the
  supported filter combinations here. In the case of Firestore, you need to create special indexes in the console to
  support filtering/sorting by more than one property. You can then specify here the indexes created.
    ```
    filterCombinations: [
        { price: "desc", available: "desc" }
    ],
    ```

- `initialFilter`: Initial filters applied to this collection. Defaults to none. Filters applied with this prop can be
  changed by the user. e.g.
  ```
  initialFilter: { age: [ ">=", 18 ] }
  ```

- `forceFilter`: Force a filter in this view. If applied, the rest of the filters will be disabled. Filters applied with
  this prop cannot be changed. e.g.
  ```
  forceFilter: { age: [ ">=", 18 ] }
  ```
- `initialSort`: Default sort applied to this collection. It takes tuples in the shape `["property_name", "asc"]`
  or `["property_name", "desc"]`

- `Actions`: Builder for rendering additional components such as buttons in the collection toolbar. The builder takes an
  object with props `entityCollection` and `selectedEntities` if any are set by the end user.

- `pagination`: If enabled, content is loaded in batches. If `false` all entities in the collection are loaded. You can
  specify a number to specify the pagination size (50 by default) Defaults to `true`.

- `additionalFields`: You can add additional fields to both the collection view and the form view by implementing an
  additional field delegate.

- `textSearchEnabled`: Flag to indicate if a search bar should be displayed on top of the collection table. Please note
  that you need to add.

- `permissions`: You can specify an object with boolean permissions with the
  shape `{edit:boolean; create:boolean; delete:boolean}` to indicate the actions the user can perform. You can also pass
  a [`PermissionsBuilder`](../api/types/permissionsbuilder) to customize the permissions based on the user or entity.

- `inlineEditing`: Can the elements in this collection be edited inline in the collection view. If this flag is set to
  false but `permissions.edit` is `true`, entities can still be edited in the side panel.

- `selectionEnabled`: Are the entities in this collection selectable. Defaults to `true`.

- `selectionController`: Pass your own selection controller if you want to control selected entities
  externally. [`useSelectionController`](../api/functions/useSelectionController)

- `exportable`: Should the data in this collection view include an export button. You can also set
  an [`ExportConfig`](../api/interfaces/exportconfig) configuration object to customize the export and add additional
  values. Defaults to `true`.

- `hideFromNavigation`: Should this collection be hidden from the main navigation panel, if it is at the root level, or
  in the entity side panel if it's a subcollection. It will still be accessible if you reach the specified path. You can
  also use this collection as a reference target.

- `callbacks`: This interface defines all the callbacks that can be used when an entity is being created, updated, or
  deleted. Useful for adding your own logic or blocking the execution of the operation.

- `views`: Array of builders for rendering additional panels in an entity view. Useful if you need to render custom
  views for your entities.
