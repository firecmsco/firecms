---
id: "AuthController"
title: "Type alias: AuthController<UserType>"
sidebar_label: "AuthController"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **AuthController**\<`UserType`\>: `Object`

Controller for retrieving the logged user or performing auth related operations.
Note that if you are implementing your AuthController, you probably will want
to do it as the result of a hook. Check useFirebaseAuthController code
for an example.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](User.md) = [`User`](User.md) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `authError?` | `any` | Error initializing the authentication |
| `authProviderError?` | `any` | Error dispatched by the auth provider |
| `getAuthToken` | () => `Promise`\<`string`\> | You can use this method to retrieve the auth token for the current user. |
| `initialLoading?` | `boolean` | Initial loading flag. It is used not to display the login screen when the app first loads, and it has not been checked whether the user is logged in or not. |
| `loginSkipped` | `boolean` | Has the user skipped the login process |
| `signOut` | () => `void` | Sign out |
| `user` | `UserType` \| ``null`` | The user currently logged in The values can be: the user object, null if they skipped login |

#### Defined in

[packages/firecms_core/src/types/auth.tsx:10](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/auth.tsx#L10)
