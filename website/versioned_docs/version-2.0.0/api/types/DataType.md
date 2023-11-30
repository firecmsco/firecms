---
id: "DataType"
title: "Type alias: DataType<T>"
sidebar_label: "DataType"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **DataType**\<`T`\>: `T` extends `string` ? ``"string"`` : `T` extends `number` ? ``"number"`` : `T` extends `boolean` ? ``"boolean"`` : `T` extends `Date` ? ``"date"`` : `T` extends [`GeoPoint`](../classes/GeoPoint.md) ? ``"geopoint"`` : `T` extends [`EntityReference`](../classes/EntityReference.md) ? ``"reference"`` : `T` extends [`CMSType`](CMSType.md)[] ? ``"array"`` : `T` extends `Record`\<`string`, `any`\> ? ``"map"`` : `never`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](CMSType.md) = [`CMSType`](CMSType.md) |

#### Defined in

[packages/firecms_core/src/types/properties.ts:12](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L12)
