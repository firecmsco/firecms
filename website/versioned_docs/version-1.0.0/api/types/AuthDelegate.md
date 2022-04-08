---
id: "AuthDelegate"
title: "Type alias: AuthDelegate<UserType>"
sidebar_label: "AuthDelegate"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **AuthDelegate**<`UserType`\>: `Object`

Controller for retrieving the logged user or performing auth related operations.
Note that if you are implementing your AuthDelegate, you probably will want
to do it as the result of a hook. Check [useFirebaseAuthDelegate](../functions/useFirebaseAuthDelegate) code
for an example.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](User) = [`User`](User) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `authError?` | `any` | Error dispatched by the auth provider |
| `initialLoading?` | `boolean` | Initial loading flag. It is used not to display the login screen when the app first loads and it has not been checked whether the user is logged in or not. |
| `loginSkipped?` | `boolean` | Has the user skipped the login process |
| `user` | `UserType` \| ``null`` | The user currently logged in The values can be: the user object, null if they skipped login |
| `signOut` | () => `void` | Sign out |
| `skipLogin?` | () => `void` | Skip login |

#### Defined in

[models/auth.tsx:81](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L81)
