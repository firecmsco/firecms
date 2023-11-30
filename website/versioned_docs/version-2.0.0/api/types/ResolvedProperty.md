---
id: "ResolvedProperty"
title: "Type alias: ResolvedProperty<T>"
sidebar_label: "ResolvedProperty"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ResolvedProperty**\<`T`\>: `T` extends `string` ? [`ResolvedStringProperty`](ResolvedStringProperty.md) : `T` extends `number` ? [`ResolvedNumberProperty`](ResolvedNumberProperty.md) : `T` extends `boolean` ? [`ResolvedBooleanProperty`](ResolvedBooleanProperty.md) : `T` extends `Date` ? [`ResolvedTimestampProperty`](ResolvedTimestampProperty.md) : `T` extends [`GeoPoint`](../classes/GeoPoint.md) ? [`ResolvedGeopointProperty`](ResolvedGeopointProperty.md) : `T` extends [`EntityReference`](../classes/EntityReference.md) ? [`ResolvedReferenceProperty`](ResolvedReferenceProperty.md) : `T` extends [`CMSType`](CMSType.md)[] ? [`ResolvedArrayProperty`](ResolvedArrayProperty.md)\<`T`\> : `T` extends `Record`\<`string`, `any`\> ? [`ResolvedMapProperty`](ResolvedMapProperty.md)\<`T`\> : `any`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](CMSType.md) = [`CMSType`](CMSType.md) |

#### Defined in

[packages/firecms_core/src/types/resolved_entities.ts:33](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/resolved_entities.ts#L33)
