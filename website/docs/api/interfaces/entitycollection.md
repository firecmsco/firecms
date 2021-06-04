---
id: "entitycollection"
title: "Interface: EntityCollection<S, Key, AdditionalKey>"
sidebar_label: "EntityCollection"
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

[models/models.ts:65](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L65)

___

### defaultSize

• `Optional` **defaultSize**: [CollectionSize](../types/collectionsize.md)

Default size of the rendered collection

#### Defined in

[models/models.ts:44](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L44)

___

### description

• `Optional` **description**: `string`

Optional description of this view. You can use Markdown.

#### Defined in

[models/models.ts:27](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L27)

___

### excludedProperties

• `Optional` **excludedProperties**: (`Key` \| `AdditionalKey`)[]

Properties that should NOT get displayed in the collection view.
All the other properties from the the entity are displayed
It has no effect if the properties value is set.

#### Defined in

[models/models.ts:116](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L116)

___

### exportable

• `Optional` **exportable**: `boolean` \| [ExportConfig](../types/exportconfig.md)

Should the data in this collection view include an export button.
You can also set an `ExportConfig` configuration object to customize
the export and add additional values.
Defaults to `true`

#### Defined in

[models/models.ts:96](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L96)

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

[models/models.ts:143](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L143)

___

### filterableProperties

• `Optional` **filterableProperties**: `Key`[]

Properties that can be filtered in this view

#### Defined in

[models/models.ts:121](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L121)

___

### group

• `Optional` **group**: `string`

Optional field used to group top level navigation entries under a
navigation view. If you set this value in a subcollection it has no
effect.

#### Defined in

[models/models.ts:51](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L51)

___

### initialFilter

• `Optional` **initialFilter**: `Partial`<{ [K in string]: [WhereFilterOp, any]}\>

Initial filters applied to this collection. Consider that you
can filter any property, but only those included in
`filterableProperties` will include the corresponding filter widget.
Defaults to none.

#### Defined in

[models/models.ts:129](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L129)

___

### initialSort

• `Optional` **initialSort**: [`Key`, ``"asc"`` \| ``"desc"``]

Default sort applied to this collection

#### Defined in

[models/models.ts:134](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L134)

___

### inlineEditing

• `Optional` **inlineEditing**: `boolean`

Can the elements in this collection be edited inline in the collection
view. If this flag is set to false but `permissions.edit` is `true`, entities
can still be edited in the side panel

#### Defined in

[models/models.ts:83](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L83)

___

### name

• **name**: `string`

Plural name of the view. E.g. 'products'

#### Defined in

[models/models.ts:22](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L22)

___

### pagination

• `Optional` **pagination**: `number` \| `boolean`

If enabled, content is loaded in batches. If `false` all entities in the
collection are loaded.
You can specify a number to specify the pagination size (50 by default)
Defaults to `true`

#### Defined in

[models/models.ts:59](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L59)

___

### permissions

• `Optional` **permissions**: [PermissionsBuilder](../types/permissionsbuilder.md)<S, Key\>

Permissions the logged-in user can perform on this collection.
If not specified everything defaults to `true`

#### Defined in

[models/models.ts:76](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L76)

___

### properties

• `Optional` **properties**: (`Key` \| `AdditionalKey`)[]

Properties displayed in this collection. If this property is not set
every property is displayed

#### Defined in

[models/models.ts:109](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L109)

___

### relativePath

• **relativePath**: `string`

Relative Firestore path of this view to its parent.
If this view is in the root the path is equal to the absolute one.
This path also determines the URL in FireCMS

#### Defined in

[models/models.ts:34](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L34)

___

### schema

• **schema**: `S`

Schema representing the entities of this view

#### Defined in

[models/models.ts:39](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L39)

___

### selectionEnabled

• `Optional` **selectionEnabled**: `boolean`

Are the entities in this collection selectable. Defaults to true

#### Defined in

[models/models.ts:88](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L88)

___

### subcollections

• `Optional` **subcollections**: [EntityCollectionView](entitycollectionview.md)<[EntitySchema](entityschema.md)<any, any\>, any, string\>[]

Following the Firestore document and collection schema, you can add
subcollections to your entity in the same way you define the root
collections.

#### Defined in

[models/models.ts:103](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L103)

___

### textSearchDelegate

• `Optional` **textSearchDelegate**: [TextSearchDelegate](textsearchdelegate.md)

If a text search delegate is supplied, a search bar is displayed on top

#### Defined in

[models/models.ts:70](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L70)
