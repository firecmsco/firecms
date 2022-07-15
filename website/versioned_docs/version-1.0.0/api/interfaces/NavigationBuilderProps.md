---
id: "NavigationBuilderProps"
title: "Interface: NavigationBuilderProps<UserType>"
sidebar_label: "NavigationBuilderProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](../types/User) = [`User`](../types/User) |

## Properties

### authController

• **authController**: [`AuthController`](AuthController)<`UserType`\>

AuthController

#### Defined in

[models/navigation.ts:31](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L31)

___

### dataSource

• **dataSource**: [`DataSource`](DataSource)

Connector to your database, e.g. your Firestore database

#### Defined in

[models/navigation.ts:47](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L47)

___

### dateTimeFormat

• `Optional` **dateTimeFormat**: `string`

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

#### Defined in

[models/navigation.ts:37](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L37)

___

### locale

• `Optional` **locale**: [`Locale`](../types/Locale)

Locale of the CMS, currently only affecting dates

#### Defined in

[models/navigation.ts:42](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L42)

___

### storageSource

• **storageSource**: [`StorageSource`](StorageSource)

Used storage implementation

#### Defined in

[models/navigation.ts:52](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L52)

___

### user

• **user**: ``null`` \| `UserType`

Logged in user or null

#### Defined in

[models/navigation.ts:26](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L26)
