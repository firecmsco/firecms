---
id: "FirebaseLoginViewProps"
title: "Interface: FirebaseLoginViewProps"
sidebar_label: "FirebaseLoginViewProps"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### NoUserComponent

• `Optional` **NoUserComponent**: `ReactNode`

Display this component when no user is found a user tries to log in
when the `signInOptions` value is `password`.

#### Defined in

[firebase_app/components/FirebaseLoginView.tsx:67](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/components/FirebaseLoginView.tsx#L67)

___

### allowSkipLogin

• `Optional` **allowSkipLogin**: `boolean`

#### Defined in

[firebase_app/components/FirebaseLoginView.tsx:54](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/components/FirebaseLoginView.tsx#L54)

___

### authDelegate

• **authDelegate**: [`FirebaseAuthDelegate`](../types/FirebaseAuthDelegate)

#### Defined in

[firebase_app/components/FirebaseLoginView.tsx:57](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/components/FirebaseLoginView.tsx#L57)

___

### disableSignupScreen

• `Optional` **disableSignupScreen**: `boolean`

Prevent users from creating new users in when the `signInOptions` value
is `password`. This does not apply to the rest of login providers.

#### Defined in

[firebase_app/components/FirebaseLoginView.tsx:62](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/components/FirebaseLoginView.tsx#L62)

___

### firebaseApp

• **firebaseApp**: `FirebaseApp`

#### Defined in

[firebase_app/components/FirebaseLoginView.tsx:56](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/components/FirebaseLoginView.tsx#L56)

___

### logo

• `Optional` **logo**: `string`

#### Defined in

[firebase_app/components/FirebaseLoginView.tsx:53](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/components/FirebaseLoginView.tsx#L53)

___

### signInOptions

• **signInOptions**: (`FirebaseSignInProvider` \| `FirebaseSignInOption`)[]

#### Defined in

[firebase_app/components/FirebaseLoginView.tsx:55](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/components/FirebaseLoginView.tsx#L55)
