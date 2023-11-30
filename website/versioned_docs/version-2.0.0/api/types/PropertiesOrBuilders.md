---
id: "PropertiesOrBuilders"
title: "Type alias: PropertiesOrBuilders<M>"
sidebar_label: "PropertiesOrBuilders"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertiesOrBuilders**\<`M`\>: \{ [k in keyof M]: PropertyOrBuilder\<M[k], M\> }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\> |

#### Defined in

[packages/firecms_core/src/types/properties.ts:293](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L293)
