---
id: "Property"
title: "Type alias: Property<T>"
sidebar_label: "Property"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **Property**\<`T`\>: `T` extends `string` ? [`StringProperty`](../interfaces/StringProperty.md) : `T` extends `number` ? [`NumberProperty`](../interfaces/NumberProperty.md) : `T` extends `boolean` ? [`BooleanProperty`](../interfaces/BooleanProperty.md) : `T` extends `Date` ? [`DateProperty`](../interfaces/DateProperty.md) : `T` extends [`GeoPoint`](../classes/GeoPoint.md) ? [`GeopointProperty`](../interfaces/GeopointProperty.md) : `T` extends [`EntityReference`](../classes/EntityReference.md) ? [`ReferenceProperty`](../interfaces/ReferenceProperty.md) : `T` extends [`CMSType`](CMSType.md)[] ? [`ArrayProperty`](../interfaces/ArrayProperty.md)\<`T`\> : `T` extends `Record`\<`string`, `any`\> ? [`MapProperty`](../interfaces/MapProperty.md)\<`T`\> : `AnyProperty`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](CMSType.md) = [`CMSType`](CMSType.md) |

#### Defined in

[packages/firecms_core/src/types/properties.ts:51](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L51)
