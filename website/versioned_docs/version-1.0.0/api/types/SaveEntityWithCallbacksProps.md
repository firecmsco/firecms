---
id: "SaveEntityWithCallbacksProps"
title: "Type alias: SaveEntityWithCallbacksProps<M>"
sidebar_label: "SaveEntityWithCallbacksProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **SaveEntityWithCallbacksProps**<`M`\>: [`SaveEntityProps`](../interfaces/SaveEntityProps)<`M`\> & { `callbacks?`: [`EntityCallbacks`](../interfaces/EntityCallbacks)<`M`\> ; `onPreSaveHookError?`: (`e`: `Error`) => `void` ; `onSaveFailure?`: (`e`: `Error`) => `void` ; `onSaveSuccess?`: (`updatedEntity`: [`Entity`](../interfaces/Entity)<`M`\>) => `void` ; `onSaveSuccessHookError?`: (`e`: `Error`) => `void`  }

#### Type parameters

| Name |
| :------ |
| `M` |

#### Defined in

[hooks/data/save.ts:15](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/save.ts#L15)
