---
id: "useFireCMSContext"
title: "Function: useFireCMSContext"
sidebar_label: "useFireCMSContext"
sidebar_position: 0
custom_edit_url: null
---

▸ **useFireCMSContext**\<`UserType`, `AuthControllerType`\>(): [`FireCMSContext`](../types/FireCMSContext.md)\<`UserType`, `AuthControllerType`\>

Hook to retrieve the [FireCMSContext](../types/FireCMSContext.md).

Consider that in order to use this hook you need to have a parent
`FireCMS` component.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |
| `AuthControllerType` | extends [`AuthController`](../types/AuthController.md)\<`UserType`\> = [`AuthController`](../types/AuthController.md)\<`UserType`\> |

#### Returns

[`FireCMSContext`](../types/FireCMSContext.md)\<`UserType`, `AuthControllerType`\>

**`See`**

FireCMSContext

#### Defined in

[packages/firecms_core/src/hooks/useFireCMSContext.tsx:24](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useFireCMSContext.tsx#L24)
