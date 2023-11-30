---
id: "DeleteEntityWithCallbacksProps"
title: "Type alias: DeleteEntityWithCallbacksProps<M>"
sidebar_label: "DeleteEntityWithCallbacksProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **DeleteEntityWithCallbacksProps**\<`M`\>: [`DeleteEntityProps`](../interfaces/DeleteEntityProps.md)\<`M`\> & \{ `callbacks?`: [`EntityCallbacks`](../interfaces/EntityCallbacks.md)\<`M`\> ; `onDeleteFailure?`: (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>, `e`: `Error`) => `void` ; `onDeleteSuccess?`: (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>) => `void` ; `onDeleteSuccessHookError?`: (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>, `e`: `Error`) => `void` ; `onPreDeleteHookError?`: (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>, `e`: `Error`) => `void`  }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Defined in

[packages/firecms_core/src/hooks/data/delete.ts:15](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/delete.ts#L15)
