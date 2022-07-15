---
id: "Property"
title: "Type alias: Property<T>"
sidebar_label: "Property"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **Property**<`T`\>: `T` extends `string` ? [`StringProperty`](../interfaces/StringProperty) : `T` extends `number` ? [`NumberProperty`](../interfaces/NumberProperty) : `T` extends `boolean` ? [`BooleanProperty`](../interfaces/BooleanProperty) : `T` extends `Date` ? [`TimestampProperty`](../interfaces/TimestampProperty) : `T` extends [`GeoPoint`](../classes/GeoPoint) ? [`GeopointProperty`](../interfaces/GeopointProperty) : `T` extends [`EntityReference`](../classes/EntityReference) ? [`ReferenceProperty`](../interfaces/ReferenceProperty) : `T` extends [`CMSType`](CMSType)[] ? [`ArrayProperty`](../interfaces/ArrayProperty)<`T`\> : `T` extends { `[Key: string]`: `any`;  } ? [`MapProperty`](../interfaces/MapProperty)<`T`\> : `AnyProperty`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](CMSType) = [`CMSType`](CMSType) |

#### Defined in

[models/properties.ts:35](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L35)
