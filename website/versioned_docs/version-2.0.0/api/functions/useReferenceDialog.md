---
id: "useReferenceDialog"
title: "Function: useReferenceDialog"
sidebar_label: "useReferenceDialog"
sidebar_position: 0
custom_edit_url: null
---

▸ **useReferenceDialog**\<`M`\>(`referenceDialogProps`): `Object`

This hook is used to open a side dialog that allows the selection
of entities under a given path.
You can use it in custom views for selecting entities.
You need to specify the path of the target collection at least.
If your collection is not defined in your  top collection configuration
(in your `FireCMS` component), you need to specify explicitly.
This is the same hook used internally when a reference property is defined.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `referenceDialogProps` | `Omit`\<[`ReferenceSelectionInnerProps`](../interfaces/ReferenceSelectionInnerProps.md)\<`M`\>, ``"path"``\> & \{ `onClose?`: () => `void` ; `path?`: `string` \| ``false``  } |

#### Returns

`Object`

| Name | Type |
| :------ | :------ |
| `close` | () => `void` |
| `open` | () => `void` |

#### Defined in

[packages/firecms_core/src/hooks/useReferenceDialog.tsx:16](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useReferenceDialog.tsx#L16)
