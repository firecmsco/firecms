---
id: "Properties"
title: "Type alias: Properties<M>"
sidebar_label: "Properties"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **Properties**\<`M`\>: \{ [k in keyof M]: Property\<M[keyof M]\> }

Record of properties of an entity or a map property

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Defined in

[packages/firecms_core/src/types/properties.ts:233](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L233)
