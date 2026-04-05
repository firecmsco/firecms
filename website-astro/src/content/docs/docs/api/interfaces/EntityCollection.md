---
slug: "docs/api/interfaces/EntityCollection"
title: "EntityCollection"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EntityCollection

# Interface: EntityCollection\<M, USER\>

Defined in: [types/src/types/collections.ts:21](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

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

Defined in: [types/src/types/collections.ts:244](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Builder for rendering additional components such as buttons in the
collection toolbar

***

### additionalFields?

> `optional` **additionalFields**: [`AdditionalFieldDelegate`](AdditionalFieldDelegate)\<`M`, `USER`\>[]

Defined in: [types/src/types/collections.ts:317](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

You can add additional fields to the collection view by implementing
an additional field delegate.

***

### alwaysApplyDefaultValues?

> `optional` **alwaysApplyDefaultValues**: `boolean`

Defined in: [types/src/types/collections.ts:393](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

If set to true, the default values of the properties will be applied
to the entity every time the entity is updated (not only when created).
Defaults to false.

***

### callbacks?

> `optional` **callbacks**: [`EntityCallbacks`](../type-aliases/EntityCallbacks)\<`M`, `USER`\>

Defined in: [types/src/types/collections.ts:238](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

This interface defines all the callbacks that can be used when an entity
is being created, updated or deleted.
Useful for adding your own logic or blocking the execution of the operation.

***

### databaseId?

> `optional` **databaseId**: `string`

Defined in: [types/src/types/collections.ts:87](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Which database within the driver.
- For Firestore: The Firestore database ID (e.g., for multi-database projects)
- For PostgreSQL: Schema or database name
- For MongoDB: Database name

If not specified, the default database of the driver is used.

***

### dbPath

> **dbPath**: `string`

Defined in: [types/src/types/collections.ts:55](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Path or table name of the collection in the database.
If not specified, the `slug` property is used, converted to snake_case.

***

### defaultSelectedView?

> `optional` **defaultSelectedView**: `string` \| [`DefaultSelectedViewBuilder`](../type-aliases/DefaultSelectedViewBuilder)

Defined in: [types/src/types/collections.ts:347](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

If you want to open custom views or subcollections by default when opening the edit
view of an entity, you can specify the path to the view here.
The path is relative to the current collection. For example if you have a collection
that has a custom view as well as a subcollection that refers to another entity, you can
either specify the path to the custom view or the path to the subcollection.

***

### defaultSize?

> `optional` **defaultSize**: [`CollectionSize`](../type-aliases/CollectionSize)

Defined in: [types/src/types/collections.ts:322](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Default size of the rendered collection

***

### defaultViewMode?

> `optional` **defaultViewMode**: [`ViewMode`](../type-aliases/ViewMode)

Defined in: [types/src/types/collections.ts:425](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Default view mode for displaying this collection.
- "table": Display entities in a spreadsheet-like table (default)
- "cards": Display entities as a grid of cards with thumbnails
- "kanban": Display entities in a Kanban board grouped by a property
Defaults to "table".

***

### description?

> `optional` **description**: `string`

Defined in: [types/src/types/collections.ts:49](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Optional description of this view. You can use Markdown.

***

### driver?

> `optional` **driver**: `string`

Defined in: [types/src/types/collections.ts:77](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Which driver handles this collection.
Use this to route collections to different backends:
- `"postgres"` - Route to PostgreSQL backend
- `"firestore"` - Route to Firestore (client-side)
- `"mongodb"` - Route to MongoDB backend
- Custom IDs for your own driver implementations

If not specified, the default driver `"(default)"` is used.

#### Example

```ts
// Simple - no driver needed for default
{ slug: "products" }

// Firestore collection (client-side real-time)
{ slug: "analytics", driver: "firestore" }

// Multiple databases within a driver
{ slug: "orders", driver: "postgres", databaseId: "orders_db" }
```

***

### enabledViews?

> `optional` **enabledViews**: [`ViewMode`](../type-aliases/ViewMode)[]

Defined in: [types/src/types/collections.ts:434](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Which view modes are available for this collection.
Possible values: "table", "cards", "kanban".
Defaults to all three: ["table", "cards", "kanban"].
Note: "kanban" will only be available if the collection has at least
one string property with enumValues defined, regardless of this setting.

***

### entityActions?

> `optional` **entityActions**: (`string` \| [`EntityAction`](../type-aliases/EntityAction)\<`M`, `USER`\>)[]

Defined in: [types/src/types/collections.ts:272](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

You can define additional actions that can be performed on the entities
in this collection. These actions can be displayed in the collection
view or in the entity view.

You can use the `onClick` method to implement your own logic.
In the `context` prop you can access all the controllers of Rebase.

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

Defined in: [types/src/types/collections.ts:311](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Array of builders for rendering additional panels in an entity view.
Useful if you need to render custom views.
You can either define the custom view inline or pass a reference to
a custom view defined in the main configuration under `entityViews`

***

### exportable?

> `optional` **exportable**: `boolean` \| [`ExportConfig`](ExportConfig)\<`USER`\>

Defined in: [types/src/types/collections.ts:370](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### filter?

> `optional` **filter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/src/types/collections.ts:295](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Initial filters applied to the collection this collection is related to.
Defaults to none. Filters applied with this prop can be changed.
e.g. `filter: { age: [">=", 18] }`
e.g. `filter: { related_user: ["==", new EntityReference("sdc43dsw2", "users")] }`

***

### forceFilter?

> `optional` **forceFilter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/src/types/collections.ts:287](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Force a filter in this view. If applied, the rest of the filters will
be disabled. Filters applied with this prop cannot be changed.
e.g. `forceFilter: { age: [">=", 18] }`
e.g. `forceFilter: { related_user: ["==", new EntityReference("sdc43dsw2", "users")] }`

***

### formAutoSave?

> `optional` **formAutoSave**: `boolean`

Defined in: [types/src/types/collections.ts:365](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

If set to true, the form will be auto-saved when the user changes
the value of a field.
Defaults to false.
When a new entity is created, this property can be updated to generated a new ID

***

### ~~group?~~

> `optional` **group**: `string`

Defined in: [types/src/types/collections.ts:163](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Optional field used to group top level navigation entries under a~
navigation view. If you set this value in a subcollection it has no
effect.

#### Deprecated

This prop is deprecated and will be removed in the future.
You can apply grouping by using the `navigationGroupMappings` prop in the
useBuildNavigationController hook instead.

***

### hideFromNavigation?

> `optional` **hideFromNavigation**: `boolean`

Defined in: [types/src/types/collections.ts:338](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Should this collection be hidden from the main navigation panel, if
it is at the root level, or in the entity side panel if it's a
subcollection.
It will still be accessible if you reach the specified path.
You can also use this collection as a reference target.

***

### hideIdFromCollection?

> `optional` **hideIdFromCollection**: `boolean`

Defined in: [types/src/types/collections.ts:357](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Should the ID of this collection be hidden from the grid view.

***

### hideIdFromForm?

> `optional` **hideIdFromForm**: `boolean`

Defined in: [types/src/types/collections.ts:352](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Should the ID of this collection be hidden from the form view.

***

### history?

> `optional` **history**: `boolean`

Defined in: [types/src/types/collections.ts:404](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

If set to true, changes to the entity will be saved in a subcollection.
This prop has no effect if the history plugin is not enabled

***

### icon?

> `optional` **icon**: `ReactNode`

Defined in: [types/src/types/collections.ts:153](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Icon key to use in this collection.
You can use any of the icons in the Material specs:
https://fonts.google.com/icons
e.g. 'account_tree' or 'person'.
Find all the icons in https://rebase.pro/docs/icons
You can also pass a React node if you want to render a custom icon.
If not specified, a default icon will be used.

***

### includeJsonView?

> `optional` **includeJsonView**: `boolean`

Defined in: [types/src/types/collections.ts:398](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

If set to true, a tab including the JSON representation of the entity will be included.

***

### inlineEditing?

> `optional` **inlineEditing**: `boolean`

Defined in: [types/src/types/collections.ts:329](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Can the elements in this collection be edited inline in the collection
view. If this flag is set to false but `permissions.edit` is `true`, entities
can still be edited in the side panel

***

### kanban?

> `optional` **kanban**: [`KanbanConfig`](KanbanConfig)\<`M`\>

Defined in: [types/src/types/collections.ts:440](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Configuration for Kanban board view mode.
When set, the Kanban view mode becomes available.

***

### localChangesBackup?

> `optional` **localChangesBackup**: `false` \| `"manual_apply"` \| `"auto_apply"`

Defined in: [types/src/types/collections.ts:416](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

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

Defined in: [types/src/types/collections.ts:38](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Name of the collection, typically plural.
E.g. `Products`, `Blog`

***

### openEntityMode?

> `optional` **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [types/src/types/collections.ts:186](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

When editing an entity, you can choose to open the entity in a side dialog
or in a full screen dialog. Defaults to `full_screen`.

***

### orderProperty?

> `optional` **orderProperty**: `Extract`\<keyof `M`, `string`\>

Defined in: [types/src/types/collections.ts:449](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Property key to use for ordering items.
Must reference a number property. When items are reordered,
this property will be updated to reflect the new order using
fractional indexing. Used by Kanban view for ordering within columns
and can be used for general ordering purposes.

***

### overrides?

> `optional` **overrides**: [`EntityOverrides`](../type-aliases/EntityOverrides)

Defined in: [types/src/types/collections.ts:381](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Overrides for the entity view, like the data source or the storage source.

***

### ownerId?

> `optional` **ownerId**: `string`

Defined in: [types/src/types/collections.ts:376](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

User id of the owner of this collection. This is used only by plugins, or if you
are writing custom code

***

### pagination?

> `optional` **pagination**: `number` \| `boolean`

Defined in: [types/src/types/collections.ts:216](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

If enabled, content is loaded in batches. If `false` all entities in the
collection are loaded. This means that when reaching the end of the
collection, the CMS will load more entities.
You can specify a number to specify the pagination size (50 by default)
Defaults to `true`

***

### previewProperties?

> `optional` **previewProperties**: `string`[]

Defined in: [types/src/types/collections.ts:173](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Default preview properties displayed when this collection is referenced to.

***

### properties

> **properties**: [`Properties`](../type-aliases/Properties)

Defined in: [types/src/types/collections.ts:168](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Set of properties that compose an entity

***

### propertiesOrder?

> `optional` **propertiesOrder**: (`string` \| `Extract`\<keyof `M`, `string`\>)[]

Defined in: [types/src/types/collections.ts:207](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

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
You can use this prop to hide some properties from the table view.
Note that if you set this prop, other ways to hide fields, like
`hidden` in the property definition,will be ignored.
`propertiesOrder` has precedence over `hidden`.

***

### relations?

> `optional` **relations**: [`Relation`](Relation)[]

Defined in: [types/src/types/collections.ts:231](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

For SQL databases, you can define the relations between collections here.

***

### securityRules?

> `optional` **securityRules**: [`SecurityRule`](SecurityRule)[]

Defined in: [types/src/types/collections.ts:140](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Security rules for this collection (Supabase-style Row Level Security).
When defined, the schema generator will enable RLS on the table and
create the corresponding PostgreSQL policies.

Supports three levels of expressiveness:
1. **Convenience shortcuts** — `ownerField`, `access`, `roles`
2. **Raw SQL** — `using` and `withCheck` for full PostgreSQL power
3. **Combined** — mix shortcuts with `roles` for common patterns

The authenticated user context is available in raw SQL via:
- `auth.uid()`   — the current user's ID
- `auth.roles()` — comma-separated app role IDs
- `auth.jwt()`   — full JWT claims as JSONB

#### Examples

```ts
// Simple: only owners can access their own rows
securityRules: [
  { operation: "all", ownerField: "user_id" }
]
```

```ts
// Public read, owner-only write (using operations array to reduce boilerplate)
securityRules: [
  { operation: "select", access: "public" },
  { operations: ["insert", "update", "delete"], ownerField: "created_by" }
]
```

```ts
// Role-based: admins read all rows, users read own
securityRules: [
  { operation: "select", roles: ["admin"], using: "true" },
  { operation: "all", ownerField: "user_id" }
]
```

```ts
// Raw SQL: cross-table check with subquery
securityRules: [
  {
    operation: "select",
    using: "EXISTS (SELECT 1 FROM org_members WHERE org_members.org_id = {org_id} AND org_members.user_id = auth.uid())"
  }
]
```

```ts
// Restrictive policy with both USING and WITH CHECK to constrain old AND new row states
securityRules: [
  { operation: "all", ownerField: "user_id" },
  { operation: "update", mode: "restrictive", using: "{is_locked} = false", withCheck: "{is_locked} = false" }
]
```

***

### selectionController?

> `optional` **selectionController**: [`SelectionController`](../type-aliases/SelectionController)\<`M`\>

Defined in: [types/src/types/collections.ts:279](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Pass your own selection controller if you want to control selected
entities externally.

#### See

useSelectionController

***

### selectionEnabled?

> `optional` **selectionEnabled**: `boolean`

Defined in: [types/src/types/collections.ts:219](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

***

### sideDialogWidth?

> `optional` **sideDialogWidth**: `string` \| `number`

Defined in: [types/src/types/collections.ts:386](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Width of the side dialog (in pixels) when opening an entity in this collection.

***

### singularName?

> `optional` **singularName**: `string`

Defined in: [types/src/types/collections.ts:44](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Singular name of an entry in this collection
E.g. `Product`, `Blog entry`

***

### slug

> **slug**: `string`

Defined in: [types/src/types/collections.ts:29](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

You can set an alias that will be used internally instead of the `path`.
The `alias` value will be used to determine the URL of the collection,
while `path` will still be used in the driver.
Note that you can use this value in reference properties too.

***

### sort?

> `optional` **sort**: \[`Extract`\<keyof `M`, `string`\>, `"desc"` \| `"asc"`\]

Defined in: [types/src/types/collections.ts:303](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Default sort applied to this collection.
When setting this prop, entities will have a default order
applied in the collection.
e.g. `sort: ["order", "asc"]`

***

### subcollections()?

> `optional` **subcollections**: () => `EntityCollection`\<`any`, `any`\>[]

Defined in: [types/src/types/collections.ts:226](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

You can add subcollections to your entity in the same way you define the root
collections. The collections added here will be displayed when opening
the side dialog of an entity.

#### Returns

`EntityCollection`\<`any`, `any`\>[]

***

### titleProperty?

> `optional` **titleProperty**: `Extract`\<keyof `M`, `string`\>

Defined in: [types/src/types/collections.ts:180](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Title property of the entity. This is the property that will be used
as the title in entity related views and references.
If not specified, the first property simple text property will be used.
