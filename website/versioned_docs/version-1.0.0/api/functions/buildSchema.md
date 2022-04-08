---
id: "buildSchema"
title: "Function: buildSchema"
sidebar_label: "buildSchema"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildSchema**<`M`\>(`schema`): [`EntitySchema`](../interfaces/EntitySchema)<`M`\>

Identity function we use to defeat the type system of Typescript and preserve
the schema keys

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`EntitySchema`](../interfaces/EntitySchema)<`M`\> |

#### Returns

[`EntitySchema`](../interfaces/EntitySchema)<`M`\>

#### Defined in

[core/builders.ts:58](https://github.com/Camberi/firecms/blob/2d60fba/src/core/builders.ts#L58)
