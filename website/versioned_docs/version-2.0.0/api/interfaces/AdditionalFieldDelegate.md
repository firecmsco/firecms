---
id: "AdditionalFieldDelegate"
title: "Interface: AdditionalFieldDelegate<M, AdditionalKey, UserType>"
sidebar_label: "AdditionalFieldDelegate"
sidebar_position: 0
custom_edit_url: null
---

Use this interface for adding additional fields to entity collection views.
If you need to do some async loading you can use [AsyncPreviewComponent](../functions/AsyncPreviewComponent.md)

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |
| `AdditionalKey` | extends `string` = `string` |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |

## Properties

### Builder

• `Optional` **Builder**: `ComponentType`\<[`AdditionalFieldDelegateProps`](../types/AdditionalFieldDelegateProps.md)\<`M`, `UserType`\>\>

Builder for the content of the cell for this column

#### Defined in

[packages/firecms_core/src/types/collections.ts:410](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L410)

___

### dependencies

• `Optional` **dependencies**: `Extract`\<keyof `M`, `string`\>[]

If this column needs to update dynamically based on other properties,
you can define an array of keys as strings with the
`dependencies` prop.
e.g. ["name", "surname"]
This is a performance optimization, if you don't define dependencies
it will be updated in every render.

#### Defined in

[packages/firecms_core/src/types/collections.ts:420](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L420)

___

### id

• **id**: `AdditionalKey`

ID of this column. You can use this id in the `properties` field of the
collection in any order you want

#### Defined in

[packages/firecms_core/src/types/collections.ts:395](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L395)

___

### name

• **name**: `string`

Header of this column

#### Defined in

[packages/firecms_core/src/types/collections.ts:400](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L400)

___

### width

• `Optional` **width**: `number`

Width of the generated column in pixels

#### Defined in

[packages/firecms_core/src/types/collections.ts:405](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/collections.ts#L405)
