---
id: "ResolvedEntityCollection"
title: "Type alias: ResolvedEntityCollection<M>"
sidebar_label: "ResolvedEntityCollection"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ResolvedEntityCollection**\<`M`\>: `Omit`\<[`EntityCollection`](../interfaces/EntityCollection.md)\<`M`\>, ``"properties"``\> & \{ `editable?`: `boolean` ; `originalCollection`: [`EntityCollection`](../interfaces/EntityCollection.md)\<`M`\> ; `properties`: [`ResolvedProperties`](ResolvedProperties.md)\<`M`\>  }

This is the same entity collection you define, only all the property builders
are resolved to regular `Property` objects.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Defined in

[packages/firecms_core/src/types/resolved_entities.ts:21](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/resolved_entities.ts#L21)
