---
id: "User"
title: "Type alias: User"
sidebar_label: "User"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **User**: { `displayName`: `string` \| ``null`` ; `email`: `string` \| ``null`` ; `isAnonymous`: `boolean` ; `metadata`: `any` ; `photoURL`: `string` \| ``null`` ; `providerId`: `string` ; `uid`: `string`  } & `any`

This interface represents a user.
It has the some of the same fields as a Firebase User.
Note that in the default implementation, we simply take the Firebase user
and use it as a FireCMS user, so that means that even if they are not mapped
in this interface, it contains all the methods of the former, such as `delete`,
`getIdToken`, etc.

#### Defined in

[models/user.ts:16](https://github.com/Camberi/firecms/blob/2d60fba/src/models/user.ts#L16)
