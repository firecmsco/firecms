---
id: "User"
title: "Type alias: User"
sidebar_label: "User"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **User**: `Object`

This interface represents a user.
It has some of the same fields as a Firebase User.
Note that in the default implementation, we simply take the Firebase user
and use it as a FireCMS user, so that means that even if they are not mapped
in this interface, it contains all the methods of the former, such as `delete`,
`getIdToken`, etc.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `displayName` | `string` \| ``null`` | The display name of the user. |
| `email` | `string` \| ``null`` | The email of the user. |
| `isAnonymous` | `boolean` |  |
| `photoURL` | `string` \| ``null`` | The profile photo URL of the user. |
| `providerId` | `string` | The provider used to authenticate the user. |
| `uid` | `string` | The user's unique ID, scoped to the project. |

#### Defined in

[packages/firecms_core/src/types/user.ts:11](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/user.ts#L11)
