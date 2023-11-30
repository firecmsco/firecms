---
id: "SaveEntityWithCallbacksProps"
title: "Type alias: SaveEntityWithCallbacksProps<M>"
sidebar_label: "SaveEntityWithCallbacksProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **SaveEntityWithCallbacksProps**\<`M`\>: [`SaveEntityProps`](../interfaces/SaveEntityProps.md)\<`M`\> & \{ `callbacks?`: [`EntityCallbacks`](../interfaces/EntityCallbacks.md)\<`M`\> ; `onPreSaveHookError?`: (`e`: `Error`) => `void` ; `onSaveFailure?`: (`e`: `Error`) => `void` ; `onSaveSuccess?`: (`updatedEntity`: [`Entity`](../interfaces/Entity.md)\<`M`\>) => `void` ; `onSaveSuccessHookError?`: (`e`: `Error`) => `void`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Defined in

[packages/firecms_core/src/hooks/data/save.ts:8](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/save.ts#L8)
