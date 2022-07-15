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
| `M` | extends `Object` = `any` |
| `AdditionalKey` | extends `string` = `string` |
| `UserType` | [`User`](../types/User) |

## Properties

### additionalColumns

• `Optional` **additionalColumns**: [`AdditionalColumnDelegate`](AdditionalColumnDelegate)<`M`, `AdditionalKey`, `UserType`\>[]

You can add additional columns to the collection view by implementing
an additional column delegate.q

#### Defined in

[models/collections.ts:78](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L78)

___

### callbacks

• `Optional` **callbacks**: [`EntityCallbacks`](EntityCallbacks)<`M`\>

This interface defines all the callbacks that can be used when an entity
is being created, updated or deleted.
Useful for adding your own logic or blocking the execution of the operation.

#### Defined in

[models/collections.ts:133](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L133)

___

### defaultSize

• `Optional` **defaultSize**: [`CollectionSize`](../types/CollectionSize)

Default size of the rendered collection

#### Defined in

[models/collections.ts:57](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L57)

___

### description

• `Optional` **description**: `string`

Optional description of this view. You can use Markdown.

#### Defined in

[models/collections.ts:27](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L27)

___

### excludedProperties

• `Optional` **excludedProperties**: (`AdditionalKey` \| `Extract`<keyof `M`, `string`\>)[]

Properties that should NOT get displayed in the collection view.
All the other properties from the the entity are displayed
It has no effect if the properties value is set.

#### Defined in

[models/collections.ts:52](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L52)

___

### exportable

• `Optional` **exportable**: `boolean` \| [`ExportConfig`](ExportConfig)<`UserType`\>

Should the data in this collection view include an export button.
You can also set an `ExportConfig` configuration object to customize
the export and add additional values.
Defaults to `true`

#### Defined in

[models/collections.ts:119](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L119)

___

### filterCombinations

• `Optional` **filterCombinations**: `Partial`<`Record`<`Extract`<keyof `M`, `string`\>, ``"asc"`` \| ``"desc"``\>\>[]

If you need to filter/sort by multiple properties in this
collection, you can define the supported filter combinations here.
In the case of Firestore, you need to create special indexes in the console to
support filtering/sorting by more than one property. You can then
specify here the indexes created.

#### Defined in

[models/collections.ts:111](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L111)

___

### group

• `Optional` **group**: `string`

Optional field used to group top level navigation entries under a
navigation view. If you set this value in a subcollection it has no
effect.

#### Defined in

[models/collections.ts:64](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L64)

___

### initialFilter

• `Optional` **initialFilter**: [`FilterValues`](../types/FilterValues)<`M`\>

Initial filters applied to this collection.
Defaults to none.

#### Defined in

[models/collections.ts:139](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L139)

___

### initialSort

• `Optional` **initialSort**: [`Extract`<keyof `M`, `string`\>, ``"asc"`` \| ``"desc"``]

Default sort applied to this collection

#### Defined in

[models/collections.ts:144](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L144)

___

### inlineEditing

• `Optional` **inlineEditing**: `boolean`

Can the elements in this collection be edited inline in the collection
view. If this flag is set to false but `permissions.edit` is `true`, entities
can still be edited in the side panel

#### Defined in

[models/collections.ts:97](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L97)

___

### name

• **name**: `string`

Plural name of the view. E.g. 'products'

#### Defined in

[models/collections.ts:22](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L22)

___

### pagination

• `Optional` **pagination**: `number` \| `boolean`

If enabled, content is loaded in batches. If `false` all entities in the
collection are loaded.
You can specify a number to specify the pagination size (50 by default)
Defaults to `true`

#### Defined in

[models/collections.ts:72](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L72)

___

### path

• **path**: `string`

Relative path of this view to its parent.
If this view is in the root the path is equal to the absolute one.
This path also determines the URL in FireCMS

#### Defined in

[models/collections.ts:34](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L34)

___

### permissions

• `Optional` **permissions**: [`PermissionsBuilder`](../types/PermissionsBuilder)<`M`, `UserType`\>

Permissions the logged-in user can perform on this collection.
If not specified everything defaults to `true`

#### Defined in

[models/collections.ts:90](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L90)

___

### properties

• `Optional` **properties**: (`AdditionalKey` \| `Extract`<keyof `M`, `string`\>)[]

Properties displayed in this collection. If this prop is not set
every property is displayed

#### Defined in

[models/collections.ts:45](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L45)

___

### schema

• **schema**: [`EntitySchema`](EntitySchema)<`M`\>

Schema representing the entities of this view

#### Defined in

[models/collections.ts:39](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L39)

___

### selectionController

• `Optional` **selectionController**: [`SelectionController`](../types/SelectionController)<`M`\>

Pass your own selection controller if you want to control selected
entities externally.

**`see`** useSelectionController

#### Defined in

[models/collections.ts:157](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L157)

___

### selectionEnabled

• `Optional` **selectionEnabled**: `boolean`

Are the entities in this collection selectable. Defaults to true

#### Defined in

[models/collections.ts:102](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L102)

___

### subcollections

• `Optional` **subcollections**: [`EntityCollection`](EntityCollection)<`any`, `any`, `any`\>[]

You can add subcollections to your entity in the same way you define the root
collections. The collections added here will be displayed when opening
the side dialog of an entity.

#### Defined in

[models/collections.ts:126](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L126)

___

### textSearchEnabled

• `Optional` **textSearchEnabled**: `boolean`

Flag to indicate if a search bar should be displayed on top of
the collection table.

#### Defined in

[models/collections.ts:84](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L84)

## Methods

### extraActions

▸ `Optional` **extraActions**(`extraActionsParams`): `ReactNode`

Builder for rendering additional components such as buttons in the
collection toolbar

#### Parameters

| Name | Type |
| :------ | :------ |
| `extraActionsParams` | [`ExtraActionsParams`](ExtraActionsParams)<`M`, `UserType`\> |

#### Returns

`ReactNode`

#### Defined in

[models/collections.ts:150](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L150)
