---
id: "ResolvedProperties"
title: "Type alias: ResolvedProperties<M>"
sidebar_label: "ResolvedProperties"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ResolvedProperties**\<`M`\>: \{ [k in keyof M]: ResolvedProperty\<M[keyof M]\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Defined in

[packages/firecms_core/src/types/resolved_entities.ts:46](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/resolved_entities.ts#L46)
