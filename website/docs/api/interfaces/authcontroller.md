---
id: "authcontroller"
title: "Interface: AuthController"
sidebar_label: "AuthController"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### authLoading

• **authLoading**: `boolean`

Is the login process ongoing

#### Defined in

[contexts/AuthContext.tsx:40](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L40)

___

### authProviderError

• **authProviderError**: `any`

Error dispatched by the auth provider

#### Defined in

[contexts/AuthContext.tsx:29](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L29)

___

### canAccessMainView

• **canAccessMainView**: `boolean`

Has the user completed the steps to access the main view, after the
login screen

#### Defined in

[contexts/AuthContext.tsx:24](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L24)

___

### extra

• `Optional` **extra**: `any`

Utility field you can use to store your custom data.
e.g: Additional user data fetched from a Firestore document

#### Defined in

[contexts/AuthContext.tsx:72](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L72)

___

### loggedUser

• **loggedUser**: ``null`` \| `User`

The Firebase user currently logged in
Either the Firebase user, null if they skipped login or undefined
if they are in the login screen

#### Defined in

[contexts/AuthContext.tsx:18](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L18)

___

### loginSkipped

• **loginSkipped**: `boolean`

Is the login skipped

#### Defined in

[contexts/AuthContext.tsx:51](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L51)

___

### notAllowedError

• **notAllowedError**: `boolean`

The current user was not allowed access

#### Defined in

[contexts/AuthContext.tsx:56](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L56)

___

### setAuthLoading

• **setAuthLoading**: (`loading`: `boolean`) => `void`

**`param`**

#### Type declaration

▸ (`loading`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `loading` | `boolean` |

##### Returns

`void`

#### Defined in

[contexts/AuthContext.tsx:46](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L46)

___

### setAuthProviderError

• **setAuthProviderError**: (`error`: `any`) => `void`

Set an auth provider error

**`param`**

#### Type declaration

▸ (`error`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `error` | `any` |

##### Returns

`void`

#### Defined in

[contexts/AuthContext.tsx:35](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L35)

___

### setExtra

• **setExtra**: (`extra`: `any`) => `void`

Set extra

#### Type declaration

▸ (`extra`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `extra` | `any` |

##### Returns

`void`

#### Defined in

[contexts/AuthContext.tsx:77](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L77)

___

### signOut

• **signOut**: () => `void`

Sign out

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[contexts/AuthContext.tsx:66](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L66)

___

### skipLogin

• **skipLogin**: () => `void`

Skip login

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[contexts/AuthContext.tsx:61](https://github.com/Camberi/firecms/blob/42dd384/src/contexts/AuthContext.tsx#L61)
