---
id: "ResolvedArrayProperty"
title: "Type alias: ResolvedArrayProperty<T, ArrayT>"
sidebar_label: "ResolvedArrayProperty"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ResolvedArrayProperty**\<`T`, `ArrayT`\>: `Omit`\<[`ArrayProperty`](../interfaces/ArrayProperty.md), ``"of"`` \| ``"oneOf"`` \| ``"dataType"``\> & \{ `dataType`: ``"array"`` ; `fromBuilder`: `boolean` ; `of?`: [`ResolvedProperty`](ResolvedProperty.md)\<`any`\> \| [`ResolvedProperty`](ResolvedProperty.md)\<`any`\>[] ; `oneOf?`: \{ `properties`: [`ResolvedProperties`](ResolvedProperties.md) ; `typeField?`: `string` ; `valueField?`: `string`  } ; `resolved`: ``true`` ; `resolvedProperties`: [`ResolvedProperty`](ResolvedProperty.md)\<`any`\>[]  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `ArrayT`[] = `any`[] |
| `ArrayT` | extends [`CMSType`](CMSType.md) = [`CMSType`](CMSType.md) |

#### Defined in

[packages/firecms_core/src/types/resolved_entities.ts:121](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/resolved_entities.ts#L121)
