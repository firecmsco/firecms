---
id: "Authenticator"
title: "Type alias: Authenticator<UserType>"
sidebar_label: "Authenticator"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **Authenticator**<`UserType`\>: (`{ user }`: { `authController`: [`AuthController`](AuthController.md)<`UserType`\> ; `dataSource`: [`DataSource`](../interfaces/DataSource.md) ; `storageSource`: [`StorageSource`](../interfaces/StorageSource.md) ; `user`: `UserType` \| ``null``  }) => `boolean` \| `Promise`<`boolean`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](User.md) = [`User`](User.md) |

#### Type declaration

▸ (`{ user }`): `boolean` \| `Promise`<`boolean`\>

Implement this function to allow access to specific users.
You might also want to load additional data for a user asynchronously
and store it using the `setExtra` method in the `authController`.

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `{ user }` | `Object` | - |
| `{ user }.authController` | [`AuthController`](AuthController.md)<`UserType`\> | AuthController |
| `{ user }.dataSource` | [`DataSource`](../interfaces/DataSource.md) | Connector to your database, e.g. your Firestore database |
| `{ user }.storageSource` | [`StorageSource`](../interfaces/StorageSource.md) | Used storage implementation |
| `{ user }.user` | `UserType` \| ``null`` | Logged in user or null |

##### Returns

`boolean` \| `Promise`<`boolean`\>

#### Defined in

[lib/src/firebase_app/types/auth.tsx:74](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/types/auth.tsx#L74)
