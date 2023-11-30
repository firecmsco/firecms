---
id: "buildProperty"
title: "Function: buildProperty"
sidebar_label: "buildProperty"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildProperty**\<`T`, `P`, `M`\>(`property`): `P` extends [`StringProperty`](../interfaces/StringProperty.md) ? [`StringProperty`](../interfaces/StringProperty.md) : `P` extends [`NumberProperty`](../interfaces/NumberProperty.md) ? [`NumberProperty`](../interfaces/NumberProperty.md) : `P` extends [`BooleanProperty`](../interfaces/BooleanProperty.md) ? [`BooleanProperty`](../interfaces/BooleanProperty.md) : `P` extends [`DateProperty`](../interfaces/DateProperty.md) ? [`DateProperty`](../interfaces/DateProperty.md) : `P` extends [`GeopointProperty`](../interfaces/GeopointProperty.md) ? [`GeopointProperty`](../interfaces/GeopointProperty.md) : `P` extends [`ReferenceProperty`](../interfaces/ReferenceProperty.md) ? [`ReferenceProperty`](../interfaces/ReferenceProperty.md) : `P` extends [`ArrayProperty`](../interfaces/ArrayProperty.md) ? [`ArrayProperty`](../interfaces/ArrayProperty.md) : `P` extends [`MapProperty`](../interfaces/MapProperty.md) ? [`MapProperty`](../interfaces/MapProperty.md) : `P` extends [`PropertyBuilder`](../types/PropertyBuilder.md)\<`T`, `M`\> ? [`PropertyBuilder`](../types/PropertyBuilder.md)\<`T`, `M`\> : `never`

Identity function we use to defeat the type system of Typescript and preserve
the property keys.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType.md) = [`CMSType`](../types/CMSType.md) |
| `P` | extends [`StringProperty`](../interfaces/StringProperty.md) \| [`NumberProperty`](../interfaces/NumberProperty.md) \| [`BooleanProperty`](../interfaces/BooleanProperty.md) \| [`DateProperty`](../interfaces/DateProperty.md) \| [`GeopointProperty`](../interfaces/GeopointProperty.md) \| [`ReferenceProperty`](../interfaces/ReferenceProperty.md) \| [`MapProperty`](../interfaces/MapProperty.md)\<`Record`\<`string`, `any`\>\> \| [`ArrayProperty`](../interfaces/ArrayProperty.md)\<[`CMSType`](../types/CMSType.md)[], [`CMSType`](../types/CMSType.md)\> \| [`PropertyBuilder`](../types/PropertyBuilder.md)\<`T`, `Record`\<`string`, `any`\>\> = [`PropertyOrBuilder`](../types/PropertyOrBuilder.md)\<`T`\> |
| `M` | extends `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `P` |

#### Returns

`P` extends [`StringProperty`](../interfaces/StringProperty.md) ? [`StringProperty`](../interfaces/StringProperty.md) : `P` extends [`NumberProperty`](../interfaces/NumberProperty.md) ? [`NumberProperty`](../interfaces/NumberProperty.md) : `P` extends [`BooleanProperty`](../interfaces/BooleanProperty.md) ? [`BooleanProperty`](../interfaces/BooleanProperty.md) : `P` extends [`DateProperty`](../interfaces/DateProperty.md) ? [`DateProperty`](../interfaces/DateProperty.md) : `P` extends [`GeopointProperty`](../interfaces/GeopointProperty.md) ? [`GeopointProperty`](../interfaces/GeopointProperty.md) : `P` extends [`ReferenceProperty`](../interfaces/ReferenceProperty.md) ? [`ReferenceProperty`](../interfaces/ReferenceProperty.md) : `P` extends [`ArrayProperty`](../interfaces/ArrayProperty.md) ? [`ArrayProperty`](../interfaces/ArrayProperty.md) : `P` extends [`MapProperty`](../interfaces/MapProperty.md) ? [`MapProperty`](../interfaces/MapProperty.md) : `P` extends [`PropertyBuilder`](../types/PropertyBuilder.md)\<`T`, `M`\> ? [`PropertyBuilder`](../types/PropertyBuilder.md)\<`T`, `M`\> : `never`

#### Defined in

[packages/firecms_core/src/core/builders.ts:43](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/builders.ts#L43)
