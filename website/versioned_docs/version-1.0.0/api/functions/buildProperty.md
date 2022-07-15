---
id: "buildProperty"
title: "Function: buildProperty"
sidebar_label: "buildProperty"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildProperty**<`T`, `P`\>(`property`): `P` extends [`StringProperty`](../interfaces/StringProperty) ? [`StringProperty`](../interfaces/StringProperty) : `P` extends [`NumberProperty`](../interfaces/NumberProperty) ? [`NumberProperty`](../interfaces/NumberProperty) : `P` extends [`BooleanProperty`](../interfaces/BooleanProperty) ? [`BooleanProperty`](../interfaces/BooleanProperty) : `P` extends [`TimestampProperty`](../interfaces/TimestampProperty) ? [`TimestampProperty`](../interfaces/TimestampProperty) : `P` extends [`GeopointProperty`](../interfaces/GeopointProperty) ? [`GeopointProperty`](../interfaces/GeopointProperty) : `P` extends [`ReferenceProperty`](../interfaces/ReferenceProperty) ? [`ReferenceProperty`](../interfaces/ReferenceProperty) : `P` extends [`ArrayProperty`](../interfaces/ArrayProperty) ? [`ArrayProperty`](../interfaces/ArrayProperty) : `P` extends [`MapProperty`](../interfaces/MapProperty) ? [`MapProperty`](../interfaces/MapProperty) : `P` extends [`PropertyBuilder`](../types/PropertyBuilder)<`T`, `any`\> ? [`PropertyBuilder`](../types/PropertyBuilder)<`T`, `any`\> : `any`

Identity function we use to defeat the type system of Typescript and preserve
the property keys.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType) |
| `P` | extends [`PropertyBuilder`](../types/PropertyBuilder)<`T`, `any`\> \| [`StringProperty`](../interfaces/StringProperty) \| [`NumberProperty`](../interfaces/NumberProperty) \| [`BooleanProperty`](../interfaces/BooleanProperty) \| [`TimestampProperty`](../interfaces/TimestampProperty) \| [`GeopointProperty`](../interfaces/GeopointProperty) \| [`ReferenceProperty`](../interfaces/ReferenceProperty)<`any`\> \| [`MapProperty`](../interfaces/MapProperty)<{ `[Key: string]`: `any`;  }\> \| [`ArrayProperty`](../interfaces/ArrayProperty)<[`CMSType`](../types/CMSType)[], `any`\> = [`PropertyOrBuilder`](../types/PropertyOrBuilder)<`T`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `property` | `P` |

#### Returns

`P` extends [`StringProperty`](../interfaces/StringProperty) ? [`StringProperty`](../interfaces/StringProperty) : `P` extends [`NumberProperty`](../interfaces/NumberProperty) ? [`NumberProperty`](../interfaces/NumberProperty) : `P` extends [`BooleanProperty`](../interfaces/BooleanProperty) ? [`BooleanProperty`](../interfaces/BooleanProperty) : `P` extends [`TimestampProperty`](../interfaces/TimestampProperty) ? [`TimestampProperty`](../interfaces/TimestampProperty) : `P` extends [`GeopointProperty`](../interfaces/GeopointProperty) ? [`GeopointProperty`](../interfaces/GeopointProperty) : `P` extends [`ReferenceProperty`](../interfaces/ReferenceProperty) ? [`ReferenceProperty`](../interfaces/ReferenceProperty) : `P` extends [`ArrayProperty`](../interfaces/ArrayProperty) ? [`ArrayProperty`](../interfaces/ArrayProperty) : `P` extends [`MapProperty`](../interfaces/MapProperty) ? [`MapProperty`](../interfaces/MapProperty) : `P` extends [`PropertyBuilder`](../types/PropertyBuilder)<`T`, `any`\> ? [`PropertyBuilder`](../types/PropertyBuilder)<`T`, `any`\> : `any`

#### Defined in

[core/builders.ts:70](https://github.com/Camberi/firecms/blob/2d60fba/src/core/builders.ts#L70)
