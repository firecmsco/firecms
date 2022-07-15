---
id: "DeleteEntityWithCallbacksProps"
title: "Type alias: DeleteEntityWithCallbacksProps<M>"
sidebar_label: "DeleteEntityWithCallbacksProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **DeleteEntityWithCallbacksProps**<`M`\>: [`DeleteEntityProps`](../interfaces/DeleteEntityProps)<`M`\> & { `callbacks?`: [`EntityCallbacks`](../interfaces/EntityCallbacks)<`M`\> ; `onDeleteFailure?`: (`entity`: [`Entity`](../interfaces/Entity)<`M`\>, `e`: `Error`) => `void` ; `onDeleteSuccess?`: (`entity`: [`Entity`](../interfaces/Entity)<`M`\>) => `void` ; `onDeleteSuccessHookError?`: (`entity`: [`Entity`](../interfaces/Entity)<`M`\>, `e`: `Error`) => `void` ; `onPreDeleteHookError?`: (`entity`: [`Entity`](../interfaces/Entity)<`M`\>, `e`: `Error`) => `void`  }

#### Type parameters

| Name |
| :------ |
| `M` |

#### Defined in

[hooks/data/delete.ts:14](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/delete.ts#L14)
