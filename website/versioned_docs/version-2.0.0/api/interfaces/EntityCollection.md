---
id: "EntityCollection"
title: "Interface: EntityCollection<M, AdditionalKey, UserType>"
sidebar_label: "EntityCollection"
sidebar_position: 0
custom_edit_url: null
---

This interface represents a view that includes a collection of entities.
It can be in the root level of the configuration, defining the main
menu navigation. You can also find it as a subcollection of a different one.

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `AdditionalKey` | extends `string` = `string` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

## Properties

### Actions

• `Optional` **Actions**: `ComponentType`\<[`CollectionActionsProps`](CollectionActionsProps.md)\<`any`, [`User`](../types/User.md), [`EntityCollection`](EntityCollection.md)\<`any`, `string`, [`User`](../types/User.md)\>\>\> \| `ComponentType`\<[`CollectionActionsProps`](CollectionActionsProps.md)\<`any`, [`User`](../types/User.md), [`EntityCollection`](EntityCollection.md)\<`any`, `string`, [`User`](../types/User.md)\>\>\>[]

Builder for rendering additional components such as buttons in the
collection toolbar

#### Defined in

[packages/firecms_core/src/types/collections.ts:142](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L142)

___

### additionalFields

• `Optional` **additionalFields**: [`AdditionalFieldDelegate`](AdditionalFieldDelegate.md)\<`M`, `AdditionalKey`, `UserType`\>[]

You can add additional fields to the collection view by implementing
an additional field delegate.

#### Defined in

[packages/firecms_core/src/types/collections.ts:219](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L219)

___

### alias

• `Optional` **alias**: `string`

You can set an alias that will be used internally instead of the `path`.
The `alias` value will be used to determine the URL of the collection,
while `path` will still be used in the datasource.
Note that you can use this value in reference properties too.

#### Defined in

[packages/firecms_core/src/types/collections.ts:58](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L58)

___

### callbacks

• `Optional` **callbacks**: [`EntityCallbacks`](EntityCallbacks.md)\<`M`, [`User`](../types/User.md)\>

This interface defines all the callbacks that can be used when an entity
is being created, updated or deleted.
Useful for adding your own logic or blocking the execution of the operation.

#### Defined in

[packages/firecms_core/src/types/collections.ts:136](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L136)

___

### collectionGroup

• `Optional` **collectionGroup**: `boolean`

If this collection is a top level navigation entry, you can set this
property to `true` to indicate that this collection is a collection group.

#### Defined in

[packages/firecms_core/src/types/collections.ts:50](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L50)

___

### customId

• `Optional` **customId**: `boolean` \| [`EnumValues`](../types/EnumValues.md) \| ``"optional"``

If this property is not set, the property will be created by the
datasource.
You can set the value to true to allow the users to choose the ID.
You can also pass a set of values (as an EnumValues object) to allow them
to pick from only those.

#### Defined in

[packages/firecms_core/src/types/collections.ts:183](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L183)

___

### defaultSelectedView

• `Optional` **defaultSelectedView**: `string` \| [`DefaultSelectedViewBuilder`](../types/DefaultSelectedViewBuilder.md)

If you want to open custom views or subcollections by default when opening the edit
view of an entity, you can specify the path to the view here.
The path is relative to the current collection. For example if you have a collection
that has a custom view as well as a subcollection that refers to another entity, you can
either specify the path to the custom view or the path to the subcollection.

#### Defined in

[packages/firecms_core/src/types/collections.ts:249](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L249)

___

### defaultSize

• `Optional` **defaultSize**: [`CollectionSize`](../types/CollectionSize.md)

Default size of the rendered collection

#### Defined in

[packages/firecms_core/src/types/collections.ts:224](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L224)

___

### description

• `Optional` **description**: `string`

Optional description of this view. You can use Markdown.

#### Defined in

[packages/firecms_core/src/types/collections.ts:37](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L37)

___

### entityActions

• `Optional` **entityActions**: [`EntityAction`](../types/EntityAction.md)\<`M`, `UserType`\>[]

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

#### Defined in

[packages/firecms_core/src/types/collections.ts:167](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L167)

___

### entityViews

• `Optional` **entityViews**: (`string` \| [`EntityCustomView`](../types/EntityCustomView.md)\<`M`\>)[]

Array of builders for rendering additional panels in an entity view.
Useful if you need to render custom views.
You can either define the custom view inline or pass a reference to
a custom view defined in the main configuration under `entityViews`

#### Defined in

[packages/firecms_core/src/types/collections.ts:213](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L213)

___

### forceFilter

• `Optional` **forceFilter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\>

Force a filter in this view. If applied, the rest of the filters will
be disabled. Filters applied with this prop cannot be changed.
e.g. `forceFilter: { age: [">=", 18] }`

#### Defined in

[packages/firecms_core/src/types/collections.ts:190](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L190)

___

### formAutoSave

• `Optional` **formAutoSave**: `boolean`

If set to true, the form will be auto-saved when the user changes
the value of a field.
Defaults to false.
You can't use this prop if you are using a `customId`

#### Defined in

[packages/firecms_core/src/types/collections.ts:267](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L267)

___

### group

• `Optional` **group**: `string`

Optional field used to group top level navigation entries under a~
navigation view. If you set this value in a subcollection it has no
effect.

#### Defined in

[packages/firecms_core/src/types/collections.ts:73](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L73)

___

### hideFromNavigation

• `Optional` **hideFromNavigation**: `boolean`

Should this collection be hidden from the main navigation panel, if
it is at the root level, or in the entity side panel if it's a
subcollection.
It will still be accessible if you reach the specified path.
You can also use this collection as a reference target.

#### Defined in

[packages/firecms_core/src/types/collections.ts:240](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L240)

___

### hideIdFromCollection

• `Optional` **hideIdFromCollection**: `boolean`

Should the ID of this collection be hidden from the grid view.

#### Defined in

[packages/firecms_core/src/types/collections.ts:259](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L259)

___

### hideIdFromForm

• `Optional` **hideIdFromForm**: `boolean`

Should the ID of this collection be hidden from the form view.

#### Defined in

[packages/firecms_core/src/types/collections.ts:254](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L254)

___

### icon

• `Optional` **icon**: `string`

Icon key to use in this collection.
You can use any of the icons in the Material specs:
https://fonts.google.com/icons
e.g. 'account_tree' or 'person'

#### Defined in

[packages/firecms_core/src/types/collections.ts:66](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L66)

___

### initialFilter

• `Optional` **initialFilter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\>

Initial filters applied to the collection this collection is related to.
Defaults to none. Filters applied with this prop can be changed.
e.g. `initialFilter: { age: [">=", 18] }`

#### Defined in

[packages/firecms_core/src/types/collections.ts:197](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L197)

___

### initialSort

• `Optional` **initialSort**: [`Extract`\<keyof `M`, `string`\>, ``"desc"`` \| ``"asc"``]

Default sort applied to this collection.
When setting this prop, entities will have a default order
applied in the collection.
e.g. `initialSort: ["order", "asc"]`

#### Defined in

[packages/firecms_core/src/types/collections.ts:205](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L205)

___

### inlineEditing

• `Optional` **inlineEditing**: `boolean`

Can the elements in this collection be edited inline in the collection
view. If this flag is set to false but `permissions.edit` is `true`, entities
can still be edited in the side panel

#### Defined in

[packages/firecms_core/src/types/collections.ts:231](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L231)

___

### name

• **name**: `string`

Name of the collection, typically plural.
E.g. `Products`, `Blog`

#### Defined in

[packages/firecms_core/src/types/collections.ts:26](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L26)

___

### pagination

• `Optional` **pagination**: `number` \| `boolean`

If enabled, content is loaded in batches. If `false` all entities in the
collection are loaded.
You can specify a number to specify the pagination size (50 by default)
Defaults to `true`

#### Defined in

[packages/firecms_core/src/types/collections.ts:105](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L105)

___

### path

• **path**: `string`

Relative path of this view to its parent.
If this view is in the root the path is equal to the absolute one.
This path also determines the URL in FireCMS, unless an alias is specified

#### Defined in

[packages/firecms_core/src/types/collections.ts:44](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L44)

___

### permissions

• `Optional` **permissions**: [`Permissions`](Permissions.md) \| [`PermissionsBuilder`](../types/PermissionsBuilder.md)\<[`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>, `UserType`, `M`\>

Permissions the logged-in user can perform on this collection.
If not specified everything defaults to `true`.

#### Defined in

[packages/firecms_core/src/types/collections.ts:117](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L117)

___

### properties

• **properties**: [`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`M`\>

Set of properties that compose an entity

#### Defined in

[packages/firecms_core/src/types/collections.ts:78](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L78)

___

### propertiesOrder

• `Optional` **propertiesOrder**: (`Extract`\<keyof `M`, `string`\> \| `Extract`\<`AdditionalKey`, `string`\>)[]

Order in which the properties are displayed.
If you are specifying your collection as code, the order is the same as the
one you define in `properties`. Additional columns are added at the
end of the list, if the order is not specified.
You can use this prop to hide some properties from the table view.
Note that if you set this prop, other ways to hide fields, like
`hidden` in the property definition, will be ignored.
`propertiesOrder` has precedence over `hidden`.
    - For properties use the property key.
    - For additional columns use the column id.
    - If you have subcollections, you get a column for each subcollection,
      with the path (or alias) as the subcollection, prefixed with
      `subcollection:`. e.g. `subcollection:orders`.
    - If you are using a collection group, you will also have an
      additional `collectionGroupParent` column.

#### Defined in

[packages/firecms_core/src/types/collections.ts:97](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L97)

___

### selectionController

• `Optional` **selectionController**: [`SelectionController`](../types/SelectionController.md)\<`M`\>

Pass your own selection controller if you want to control selected
entities externally.

**`See`**

useSelectionController

#### Defined in

[packages/firecms_core/src/types/collections.ts:174](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L174)

___

### selectionEnabled

• `Optional` **selectionEnabled**: `boolean`

Are the entities in this collection selectable. Defaults to `true`

#### Defined in

[packages/firecms_core/src/types/collections.ts:122](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L122)

___

### singularName

• `Optional` **singularName**: `string`

Singular name of an entry in this collection
E.g. `Product`, `Blog entry`

#### Defined in

[packages/firecms_core/src/types/collections.ts:32](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L32)

___

### subcollections

• `Optional` **subcollections**: [`EntityCollection`](EntityCollection.md)\<`any`, `any`, [`User`](../types/User.md)\>[]

You can add subcollections to your entity in the same way you define the root
collections. The collections added here will be displayed when opening
the side dialog of an entity.

#### Defined in

[packages/firecms_core/src/types/collections.ts:129](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L129)

___

### textSearchEnabled

• `Optional` **textSearchEnabled**: `boolean`

Flag to indicate if a search bar should be displayed on top of
the collection table.

#### Defined in

[packages/firecms_core/src/types/collections.ts:111](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L111)
