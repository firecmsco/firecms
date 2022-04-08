---
id: "Authenticator"
title: "Type alias: Authenticator<UserType>"
sidebar_label: "Authenticator"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **Authenticator**<`UserType`\>: (`{ user }`: { `authController`: [`AuthController`](../interfaces/AuthController)<`UserType`\> ; `dataSource`: [`DataSource`](../interfaces/DataSource) ; `dateTimeFormat?`: `string` ; `locale?`: [`Locale`](Locale) ; `storageSource`: [`StorageSource`](../interfaces/StorageSource) ; `user`: `UserType` \| ``null``  }) => `boolean` \| `Promise`<`boolean`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](User) = [`User`](User) |

#### Type declaration

▸ (`{ user }`): `boolean` \| `Promise`<`boolean`\>

Implement this function to allow access to specific users.
You might want to load additional properties for a user asynchronously
and store it using the `setExtra` method in the `authController`

##### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `{ user }` | `Object` | - |
| `{ user }.authController` | [`AuthController`](../interfaces/AuthController)<`UserType`\> | AuthController |
| `{ user }.dataSource` | [`DataSource`](../interfaces/DataSource) | Connector to your database, e.g. your Firestore database |
| `{ user }.dateTimeFormat?` | `string` | Format of the dates in the CMS. Defaults to 'MMMM dd, yyyy, HH:mm:ss' |
| `{ user }.locale?` | [`Locale`](Locale) | Locale of the CMS, currently only affecting dates |
| `{ user }.storageSource` | [`StorageSource`](../interfaces/StorageSource) | Used storage implementation |
| `{ user }.user` | `UserType` \| ``null`` | Logged in user or null |

##### Returns

`boolean` \| `Promise`<`boolean`\>

#### Defined in

[models/user.ts:55](https://github.com/Camberi/firecms/blob/2d60fba/src/models/user.ts#L55)
