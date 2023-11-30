---
id: "useAuthController"
title: "Function: useAuthController"
sidebar_label: "useAuthController"
sidebar_position: 0
custom_edit_url: null
---

▸ **useAuthController**\<`UserType`, `AuthControllerType`\>(): `AuthControllerType`

Hook to retrieve the AuthContext.

Consider that in order to use this hook you need to have a parent
`FireCMS`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](../types/User.md) = [`User`](../types/User.md) |
| `AuthControllerType` | extends [`AuthController`](../types/AuthController.md)\<`UserType`\> = [`AuthController`](../types/AuthController.md)\<`UserType`\> |

#### Returns

`AuthControllerType`

**`See`**

AuthController

#### Defined in

[packages/firecms_core/src/hooks/useAuthController.tsx:14](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useAuthController.tsx#L14)
