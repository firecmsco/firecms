---
slug: "docs/api/interfaces/EntityCollection"
title: "EntityCollection"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / EntityCollection

# Interface: EntityCollection\<M, USER\>

Defined in: [types/collections.ts:20](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

This interface represents a view that includes a collection of entities.
It can be in the root level of the configuration, defining the main
menu navigation. You can also find it as a subcollection of a different one.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = `any`

## Properties

### Actions?

> `optional` **Actions**: `ComponentType`\<[`CollectionActionsProps`](CollectionActionsProps)\<`any`, [`User`](../type-aliases/User), `EntityCollection`\<`any`, `any`\>\>\> \| `ComponentType`\<[`CollectionActionsProps`](CollectionActionsProps)\<`any`, [`User`](../type-aliases/User), `EntityCollection`\<`any`, `any`\>\>\>[]

Defined in: [types/collections.ts:177](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Builder for rendering additional components such as buttons in the
collection toolbar

***

### additionalFields?

> `optional` **additionalFields**: [`AdditionalFieldDelegate`](AdditionalFieldDelegate)\<`M`, `USER`\>[]

Defined in: [types/collections.ts:259](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

You can add additional fields to the collection view by implementing
an additional field delegate.

***

### alwaysApplyDefaultValues?

> `optional` **alwaysApplyDefaultValues**: `boolean`

Defined in: [types/collections.ts:343](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If set to true, the default values of the properties will be applied
to the entity every time the entity is updated (not only when created).
Defaults to false.

***

### callbacks?

> `optional` **callbacks**: [`EntityCallbacks`](../type-aliases/EntityCallbacks)\<`M`, `USER`\>

Defined in: [types/collections.ts:171](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

This interface defines all the callbacks that can be used when an entity
is being created, updated or deleted.
Useful for adding your own logic or blocking the execution of the operation.

***

### collectionGroup?

> `optional` **collectionGroup**: `boolean`

Defined in: [types/collections.ts:64](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If this collection is a top level navigation entry, you can set this
property to `true` to indicate that this collection is a collection group.

***

### customId?

> `optional` **customId**: `boolean` \| [`EnumValues`](../type-aliases/EnumValues) \| `"optional"`

Defined in: [types/collections.ts:221](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If this property is not set, the property will be created by the
datasource.
You can set the value to true to allow the users to choose the ID.
You can also pass a set of values (as an EnumValues object) to allow them
to pick from only those.

***

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [types/collections.ts:58](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Optional database id of this collection. If not specified, the default
database id will be used.

***

### defaultSelectedView?

> `optional` **defaultSelectedView**: `string` \| [`DefaultSelectedViewBuilder`](../type-aliases/DefaultSelectedViewBuilder)

Defined in: [types/collections.ts:289](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If you want to open custom views or subcollections by default when opening the edit
view of an entity, you can specify the path to the view here.
The path is relative to the current collection. For example if you have a collection
that has a custom view as well as a subcollection that refers to another entity, you can
either specify the path to the custom view or the path to the subcollection.

***

### defaultSize?

> `optional` **defaultSize**: [`CollectionSize`](../type-aliases/CollectionSize)

Defined in: [types/collections.ts:264](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Default size of the rendered collection

***

### description?

> `optional` **description**: `string`

Defined in: [types/collections.ts:45](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Optional description of this view. You can use Markdown.

***

### editable?

> `optional` **editable**: `boolean`

Defined in: [types/collections.ts:336](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Can this collection configuration be edited by the end user.
Defaults to `true`.
Keep in mind that you can also set this prop to individual properties.
This prop has only effect if you are using the collection editor.

***

### entityActions?

> `optional` **entityActions**: (`string` \| [`EntityAction`](../type-aliases/EntityAction)\<`M`, `USER`\>)[]

Defined in: [types/collections.ts:205](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

You can define additional actions that can be performed on the entities
in this collection. These actions can be displayed in the collection
view or in the entity view.

You can use the `onClick` method to implement your own logic.
In the `context` prop you can access all the controllers of FireCMS.

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

You can also pass the action as a string that represents the `key`, in which case it will
use the action defined in the main configuration under `entityActions`.

***

### entityViews?

> `optional` **entityViews**: (`string` \| [`EntityCustomView`](../type-aliases/EntityCustomView)\<`M`\>)[]

Defined in: [types/collections.ts:253](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Array of builders for rendering additional panels in an entity view.
Useful if you need to render custom views.
You can either define the custom view inline or pass a reference to
a custom view defined in the main configuration under `entityViews`

***

### exportable?

> `optional` **exportable**: `boolean` \| [`ExportConfig`](ExportConfig)\<`USER`\>

Defined in: [types/collections.ts:312](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

***

### forceFilter?

> `optional` **forceFilter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/collections.ts:229](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Force a filter in this view. If applied, the rest of the filters will
be disabled. Filters applied with this prop cannot be changed.
e.g. `forceFilter: { age: [">=", 18] }`
e.g. `forceFilter: { related_user: ["==", new EntityReference("sdc43dsw2", "users")] }`

***

### formAutoSave?

> `optional` **formAutoSave**: `boolean`

Defined in: [types/collections.ts:307](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If set to true, the form will be auto-saved when the user changes
the value of a field.
Defaults to false.
You can't use this prop if you are using a `customId`

***

### ~~group?~~

> `optional` **group**: `string`

Defined in: [types/collections.ts:85](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Optional field used to group top level navigation entries under a~
navigation view. If you set this value in a subcollection it has no
effect.

#### Deprecated

This prop is deprecated and will be removed in the future.
You can apply grouping by using the `navigationGroupMappings` prop in the
[useBuildNavigationController](../functions/useBuildNavigationController) hook instead.

***

### hideFromNavigation?

> `optional` **hideFromNavigation**: `boolean`

Defined in: [types/collections.ts:280](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Should this collection be hidden from the main navigation panel, if
it is at the root level, or in the entity side panel if it's a
subcollection.
It will still be accessible if you reach the specified path.
You can also use this collection as a reference target.

***

### hideIdFromCollection?

> `optional` **hideIdFromCollection**: `boolean`

Defined in: [types/collections.ts:299](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Should the ID of this collection be hidden from the grid view.

***

### hideIdFromForm?

> `optional` **hideIdFromForm**: `boolean`

Defined in: [types/collections.ts:294](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Should the ID of this collection be hidden from the form view.

***

### history?

> `optional` **history**: `boolean`

Defined in: [types/collections.ts:354](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If set to true, changes to the entity will be saved in a subcollection.
This prop has no effect if the history plugin is not enabled

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [types/collections.ts:75](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Icon key to use in this collection.
You can use any of the icons in the Material specs:
https://fonts.google.com/icons
e.g. 'account_tree' or 'person'.
Find all the icons in https://firecms.co/docs/icons
You can also pass a React node if you want to render a custom icon.
If not specified, a default icon will be used.

***

### id

> **id**: `string`

Defined in: [types/collections.ts:28](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

You can set an alias that will be used internally instead of the `path`.
The `alias` value will be used to determine the URL of the collection,
while `path` will still be used in the datasource.
Note that you can use this value in reference properties too.

***

### includeJsonView?

> `optional` **includeJsonView**: `boolean`

Defined in: [types/collections.ts:348](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If set to true, a tab including the JSON representation of the entity will be included.

***

### initialFilter?

> `optional` **initialFilter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/collections.ts:237](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Initial filters applied to the collection this collection is related to.
Defaults to none. Filters applied with this prop can be changed.
e.g. `initialFilter: { age: [">=", 18] }`
e.g. `initialFilter: { related_user: ["==", new EntityReference("sdc43dsw2", "users")] }`

***

### initialSort?

> `optional` **initialSort**: \[`Extract`\<keyof `M`, `string`\>, `"desc"` \| `"asc"`\]

Defined in: [types/collections.ts:245](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Default sort applied to this collection.
When setting this prop, entities will have a default order
applied in the collection.
e.g. `initialSort: ["order", "asc"]`

***

### inlineEditing?

> `optional` **inlineEditing**: `boolean`

Defined in: [types/collections.ts:271](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Can the elements in this collection be edited inline in the collection
view. If this flag is set to false but `permissions.edit` is `true`, entities
can still be edited in the side panel

***

### localChangesBackup?

> `optional` **localChangesBackup**: `false` \| `"manual_apply"` \| `"auto_apply"`

Defined in: [types/collections.ts:366](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Should local changes be backed up in local storage, to prevent data loss on
accidental navigations.
- `manual_apply`: When the user navigates back to an entity with local changes,
  they will be prompted to restore the changes.
- `auto_apply`: When the user navigates back to an entity with local changes,
  the changes will be automatically applied.
- `false`: Local changes will not be backed up.
Defaults to `manual_apply`.

***

### name

> **name**: `string`

Defined in: [types/collections.ts:34](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Name of the collection, typically plural.
E.g. `Products`, `Blog`

***

### openEntityMode?

> `optional` **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [types/collections.ts:108](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

When editing an entity, you can choose to open the entity in a side dialog
or in a full screen dialog. Defaults to `full_screen`.

***

### overrides?

> `optional` **overrides**: [`EntityOverrides`](../type-aliases/EntityOverrides)

Defined in: [types/collections.ts:323](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Overrides for the entity view, like the data source or the storage source.

***

### ownerId?

> `optional` **ownerId**: `string`

Defined in: [types/collections.ts:318](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

User id of the owner of this collection. This is used only by plugins, or if you
are writing custom code

***

### pagination?

> `optional` **pagination**: `number` \| `boolean`

Defined in: [types/collections.ts:140](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

If enabled, content is loaded in batches. If `false` all entities in the
collection are loaded. This means that when reaching the end of the
collection, the CMS will load more entities.
You can specify a number to specify the pagination size (50 by default)
Defaults to `true`

***

### path

> **path**: `string`

Defined in: [types/collections.ts:52](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Relative path of this view to its parent.
If this view is in the root the path is equal to the absolute one.
This path also determines the URL in FireCMS, unless an alias is specified

***

### permissions?

> `optional` **permissions**: [`Permissions`](Permissions) \| [`PermissionsBuilder`](../type-aliases/PermissionsBuilder)\<`EntityCollection`\<`any`, `any`\>, `USER`, `M`\>

Defined in: [types/collections.ts:152](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Permissions the logged-in user can perform on this collection.
If not specified everything defaults to `true`.

***

### previewProperties?

> `optional` **previewProperties**: `string`[]

Defined in: [types/collections.ts:95](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Default preview properties displayed when this collection is referenced to.

***

### properties

> **properties**: [`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`M`\>

Defined in: [types/collections.ts:90](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Set of properties that compose an entity

***

### propertiesOrder?

> `optional` **propertiesOrder**: (`string` \| `Extract`\<keyof `M`, `string`\>)[]

Defined in: [types/collections.ts:131](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Order in which the properties are displayed.
If you are specifying your collection as code, the order is the same as the
one you define in `properties`. Additional columns are added at the
end of the list, if the order is not specified.
You can use this prop to hide some properties from the table view.
Note that if you set this prop, other ways to hide fields, like
`hidden` in the property definition, will be ignored.
`propertiesOrder` has precedence over `hidden`.
    - For properties use the property key.
    - For additional fields use the field key.
    - If you have subcollections, you get a column for each subcollection,
      with the path (or alias) as the subcollection, prefixed with
      `subcollection:`. e.g. `subcollection:orders`.
    - If you are using a collection group, you will also have an
      additional `collectionGroupParent` column.
You can use this prop to hide some properties from the table view.
Note that if you set this prop, other ways to hide fields, like
`hidden` in the property definition,will be ignored.
`propertiesOrder` has precedence over `hidden`.

***

### selectionController?

> `optional` **selectionController**: [`SelectionController`](../type-aliases/SelectionController)\<`M`\>

Defined in: [types/collections.ts:212](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Pass your own selection controller if you want to control selected
entities externally.

#### See

useSelectionController

***

### selectionEnabled?

> `optional` **selectionEnabled**: `boolean`

Defined in: [types/collections.ts:157](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Are the entities in this collection selectable. Defaults to `true`

***

### sideDialogWidth?

> `optional` **sideDialogWidth**: `string` \| `number`

Defined in: [types/collections.ts:328](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Width of the side dialog (in pixels) when opening an entity in this collection.

***

### singularName?

> `optional` **singularName**: `string`

Defined in: [types/collections.ts:40](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Singular name of an entry in this collection
E.g. `Product`, `Blog entry`

***

### subcollections?

> `optional` **subcollections**: `EntityCollection`\<`any`, `any`\>[]

Defined in: [types/collections.ts:164](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

You can add subcollections to your entity in the same way you define the root
collections. The collections added here will be displayed when opening
the side dialog of an entity.

***

### textSearchEnabled?

> `optional` **textSearchEnabled**: `boolean`

Defined in: [types/collections.ts:146](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Flag to indicate if a search bar should be displayed on top of
the collection table.

***

### titleProperty?

> `optional` **titleProperty**: keyof `M`

Defined in: [types/collections.ts:102](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/collections.ts)

Title property of the entity. This is the property that will be used
as the title in entity related views and references.
If not specified, the first property simple text property will be used.
