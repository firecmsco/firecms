---
id: "ListenCollectionProps"
title: "Type alias: ListenCollectionProps<M>"
sidebar_label: "ListenCollectionProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ListenCollectionProps**\<`M`\>: [`FetchCollectionProps`](../interfaces/FetchCollectionProps.md)\<`M`\> & \{ `onError?`: (`error`: `Error`) => `void` ; `onUpdate`: (`entities`: [`Entity`](../interfaces/Entity.md)\<`M`\>[]) => `void`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

#### Defined in

[packages/firecms_core/src/types/datasource.ts:41](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L41)
