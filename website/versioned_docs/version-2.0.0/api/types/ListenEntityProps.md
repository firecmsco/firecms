---
id: "ListenEntityProps"
title: "Type alias: ListenEntityProps<M>"
sidebar_label: "ListenEntityProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ListenEntityProps**\<`M`\>: [`FetchEntityProps`](../interfaces/FetchEntityProps.md)\<`M`\> & \{ `onError?`: (`error`: `Error`) => `void` ; `onUpdate`: (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>) => `void`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Defined in

[packages/firecms_core/src/types/datasource.ts:17](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L17)
