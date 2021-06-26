---
id: "additionalcolumndelegate"
title: "Interface: AdditionalColumnDelegate<AdditionalKey, S, Key>"
sidebar_label: "AdditionalColumnDelegate"
sidebar_position: 0
custom_edit_url: null
---

Use this interface for adding additional columns to entity collection views.
If you need to do some async loading you can use AsyncPreviewComponent

## Type parameters

| Name | Type |
| :------ | :------ |
| `AdditionalKey` | `AdditionalKey`: `string` = `string` |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> = [EntitySchema](entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

## Properties

### builder

• **builder**: (`entity`: [Entity](entity.md)<S, Key\>) => `ReactNode`

Builder for the content of the cell for this column

#### Type declaration

▸ (`entity`): `ReactNode`

##### Parameters

| Name | Type |
| :------ | :------ |
| `entity` | [Entity](entity.md)<S, Key\> |

##### Returns

`ReactNode`

#### Defined in

[models/collections.ts:205](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L205)

___

### id

• **id**: `AdditionalKey`

Id of this column. You can use this id in the `properties` field of the
collection in any order you want

#### Defined in

[models/collections.ts:190](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L190)

___

### title

• **title**: `string`

Header of this column

#### Defined in

[models/collections.ts:195](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L195)

___

### width

• `Optional` **width**: `number`

Width of the generated column in pixels

#### Defined in

[models/collections.ts:200](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L200)
