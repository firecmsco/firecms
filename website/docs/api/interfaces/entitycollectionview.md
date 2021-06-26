---
id: "entitycollectionview"
title: "Interface: EntityCollectionView<S, Key, AdditionalKey>"
sidebar_label: "EntityCollectionView"
sidebar_position: 0
custom_edit_url: null
---

This interface represents a view that includes a collection of entities.
It can be in the root level of the configuration, defining the main
menu navigation.

If you need a lower level implementation you can check CollectionTable

## Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> = [EntitySchema](entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |
| `AdditionalKey` | `AdditionalKey`: `string` = `string` |

## Properties

### additionalColumns

• `Optional` **additionalColumns**: [AdditionalColumnDelegate](additionalcolumndelegate.md)<AdditionalKey, S, Key\>[]

You can add additional columns to the collection view by implementing
an additional column delegate.q

#### Defined in

[models/collections.ts:62](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L62)

___

### defaultSize

• `Optional` **defaultSize**: [CollectionSize](../types/collectionsize.md)

Default size of the rendered collection

#### Defined in

[models/collections.ts:41](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L41)

___

### description

• `Optional` **description**: `string`

Optional description of this view. You can use Markdown.

#### Defined in

[models/collections.ts:24](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L24)

___

### excludedProperties

• `Optional` **excludedProperties**: (`Key` \| `AdditionalKey`)[]

Properties that should NOT get displayed in the collection view.
All the other properties from the the entity are displayed
It has no effect if the properties value is set.

#### Defined in

[models/collections.ts:113](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L113)

___

### exportable

• `Optional` **exportable**: `boolean` \| [ExportConfig](../types/exportconfig.md)

Should the data in this collection view include an export button.
You can also set an `ExportConfig` configuration object to customize
the export and add additional values.
Defaults to `true`

#### Defined in

[models/collections.ts:93](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L93)

___

### extraActions

• `Optional` **extraActions**: (`extraActionsParams`: [ExtraActionsParams](../types/extraactionsparams.md)<S, Key\>) => `ReactNode`

Builder for rendering additional components such as buttons in the
collection toolbar

**`param`** this collection view

**`param`** current selected entities by the end user or
undefined if none

#### Type declaration

▸ (`extraActionsParams`): `ReactNode`

##### Parameters

| Name | Type |
| :------ | :------ |
| `extraActionsParams` | [ExtraActionsParams](../types/extraactionsparams.md)<S, Key\> |

##### Returns

`ReactNode`

#### Defined in

[models/collections.ts:140](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L140)

___

### filterableProperties

• `Optional` **filterableProperties**: `Key`[]

Properties that can be filtered in this view

#### Defined in

[models/collections.ts:118](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L118)

___

### group

• `Optional` **group**: `string`

Optional field used to group top level navigation entries under a
navigation view. If you set this value in a subcollection it has no
effect.

#### Defined in

[models/collections.ts:48](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L48)

___

### initialFilter

• `Optional` **initialFilter**: `Partial`<{ [K in string]: [WhereFilterOp, any]}\>

Initial filters applied to this collection. Consider that you
can filter any property, but only those included in
`filterableProperties` will include the corresponding filter widget.
Defaults to none.

#### Defined in

[models/collections.ts:126](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L126)

___

### initialSort

• `Optional` **initialSort**: [`Key`, ``"asc"`` \| ``"desc"``]

Default sort applied to this collection

#### Defined in

[models/collections.ts:131](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L131)

___

### inlineEditing

• `Optional` **inlineEditing**: `boolean`

Can the elements in this collection be edited inline in the collection
view. If this flag is set to false but `permissions.edit` is `true`, entities
can still be edited in the side panel

#### Defined in

[models/collections.ts:80](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L80)

___

### name

• **name**: `string`

Plural name of the view. E.g. 'products'

#### Defined in

[models/collections.ts:19](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L19)

___

### pagination

• `Optional` **pagination**: `number` \| `boolean`

If enabled, content is loaded in batches. If `false` all entities in the
collection are loaded.
You can specify a number to specify the pagination size (50 by default)
Defaults to `true`

#### Defined in

[models/collections.ts:56](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L56)

___

### permissions

• `Optional` **permissions**: [PermissionsBuilder](../types/permissionsbuilder.md)<S, Key\>

Permissions the logged-in user can perform on this collection.
If not specified everything defaults to `true`

#### Defined in

[models/collections.ts:73](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L73)

___

### properties

• `Optional` **properties**: (`Key` \| `AdditionalKey`)[]

Properties displayed in this collection. If this property is not set
every property is displayed

#### Defined in

[models/collections.ts:106](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L106)

___

### relativePath

• **relativePath**: `string`

Relative Firestore path of this view to its parent.
If this view is in the root the path is equal to the absolute one.
This path also determines the URL in FireCMS

#### Defined in

[models/collections.ts:31](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L31)

___

### schema

• **schema**: `S`

Schema representing the entities of this view

#### Defined in

[models/collections.ts:36](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L36)

___

### selectionEnabled

• `Optional` **selectionEnabled**: `boolean`

Are the entities in this collection selectable. Defaults to true

#### Defined in

[models/collections.ts:85](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L85)

___

### subcollections

• `Optional` **subcollections**: [EntityCollectionView](entitycollectionview.md)<[EntitySchema](entityschema.md)<any\>, any, string\>[]

Following the Firestore document and collection schema, you can add
subcollections to your entity in the same way you define the root
collections.

#### Defined in

[models/collections.ts:100](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L100)

___

### textSearchDelegate

• `Optional` **textSearchDelegate**: [TextSearchDelegate](textsearchdelegate.md)

If a text search delegate is supplied, a search bar is displayed on top

#### Defined in

[models/collections.ts:67](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L67)
