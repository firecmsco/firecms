---
id: "AdditionalColumnDelegate"
title: "Interface: AdditionalColumnDelegate<M, AdditionalKey, UserType>"
sidebar_label: "AdditionalColumnDelegate"
sidebar_position: 0
custom_edit_url: null
---

Use this interface for adding additional columns to entity collection views.
If you need to do some async loading you can use AsyncPreviewComponent

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` = `any` |
| `AdditionalKey` | extends `string` = `string` |
| `UserType` | [`User`](../types/User) |

## Properties

### dependencies

• `Optional` **dependencies**: `Extract`<keyof `M`, `string`\>[]

If this column needs to update dynamically based on other properties,
you can define an array of keys as strings with the
`dependencies` prop.
e.g. ["name", "surname"]
If you don't specify this prop, the generated column will not rerender
on entity property updates.

#### Defined in

[models/collections.ts:208](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L208)

___

### id

• **id**: `AdditionalKey`

Id of this column. You can use this id in the `properties` field of the
collection in any order you want

#### Defined in

[models/collections.ts:180](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L180)

___

### title

• **title**: `string`

Header of this column

#### Defined in

[models/collections.ts:185](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L185)

___

### width

• `Optional` **width**: `number`

Width of the generated column in pixels

#### Defined in

[models/collections.ts:190](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L190)

## Methods

### builder

▸ **builder**(`__namedParameters`): `ReactNode`

Builder for the content of the cell for this column

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.context` | [`FireCMSContext`](FireCMSContext)<`UserType`\> |
| `__namedParameters.entity` | [`Entity`](Entity)<`M`\> |

#### Returns

`ReactNode`

#### Defined in

[models/collections.ts:195](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L195)
