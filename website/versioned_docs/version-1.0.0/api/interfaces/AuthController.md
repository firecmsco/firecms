---
id: "AuthController"
title: "Interface: AuthController<UserType>"
sidebar_label: "AuthController"
sidebar_position: 0
custom_edit_url: null
---

Controller for retrieving the logged user or performing auth related operations

## Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](../types/User) = [`User`](../types/User) |

## Properties

### authDelegate

• **authDelegate**: [`AuthDelegate`](../types/AuthDelegate)<`UserType`\>

Delegate in charge of connecting to a backend and performing the auth
operations.

#### Defined in

[models/auth.tsx:70](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L70)

___

### authLoading

• **authLoading**: `boolean`

If you have defined an [Authenticator](../types/Authenticator), this flag will be set to
true while it loads

#### Defined in

[models/auth.tsx:39](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L39)

___

### canAccessMainView

• **canAccessMainView**: `boolean`

Has the user completed the steps to access the main view, after the
login screen

#### Defined in

[models/auth.tsx:26](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L26)

___

### extra

• `Optional` **extra**: `any`

Utility field you can use to store your custom data.
e.g: Additional user data fetched from a Firestore document, or custom
claims

#### Defined in

[models/auth.tsx:56](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L56)

___

### initialLoading

• **initialLoading**: `boolean`

Initial loading flag. It is used not to display the login screen
when the app first loads and it has not been checked whether the user
is logged in or not.

#### Defined in

[models/auth.tsx:33](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L33)

___

### loginSkipped

• `Optional` **loginSkipped**: `boolean`

Has the user skipped the login process

#### Defined in

[models/auth.tsx:20](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L20)

___

### notAllowedError

• **notAllowedError**: `any`

The current user was not allowed access

#### Defined in

[models/auth.tsx:44](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L44)

___

### user

• **user**: ``null`` \| `UserType`

The user currently logged in
The values can be: the user object, null if they skipped login

#### Defined in

[models/auth.tsx:15](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L15)

## Methods

### setExtra

▸ **setExtra**(`extra`): `void`

You can use this method to store any extra data you would like to
associate your user to.
e.g: Additional user data fetched from a Firestore document, or custom
claims

#### Parameters

| Name | Type |
| :------ | :------ |
| `extra` | `any` |

#### Returns

`void`

#### Defined in

[models/auth.tsx:64](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L64)

___

### signOut

▸ **signOut**(): `void`

Sign out

#### Returns

`void`

#### Defined in

[models/auth.tsx:49](https://github.com/Camberi/firecms/blob/2d60fba/src/models/auth.tsx#L49)
