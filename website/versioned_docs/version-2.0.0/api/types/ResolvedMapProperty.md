---
id: "ResolvedMapProperty"
title: "Type alias: ResolvedMapProperty<T>"
sidebar_label: "ResolvedMapProperty"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ResolvedMapProperty**\<`T`\>: `Omit`\<[`MapProperty`](../interfaces/MapProperty.md), ``"properties"`` \| ``"dataType"`` \| ``"propertiesOrder"``\> & \{ `dataType`: ``"map"`` ; `fromBuilder`: `boolean` ; `properties?`: [`ResolvedProperties`](ResolvedProperties.md)\<`T`\> ; `propertiesOrder?`: `Extract`\<keyof `T`, `string`\>[] ; `resolved`: ``true``  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, `any`\> = `any` |

#### Defined in

[packages/firecms_core/src/types/resolved_entities.ts:140](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/resolved_entities.ts#L140)
