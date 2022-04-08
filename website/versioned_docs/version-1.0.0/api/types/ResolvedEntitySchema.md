---
id: "ResolvedEntitySchema"
title: "Type alias: ResolvedEntitySchema<M>"
sidebar_label: "ResolvedEntitySchema"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ResolvedEntitySchema**<`M`\>: `Omit`<[`EntitySchema`](../interfaces/EntitySchema)<`M`\>, ``"properties"``\> & { `originalSchema`: [`EntitySchema`](../interfaces/EntitySchema)<`M`\> ; `properties`: [`Properties`](Properties)<`M`\>  }

This is the same entity schema you define, only all the property builders
are resolved to regular `Property` objects.

#### Type parameters

| Name |
| :------ |
| `M` |

#### Defined in

[models/entities.ts:75](https://github.com/Camberi/firecms/blob/2d60fba/src/models/entities.ts#L75)
