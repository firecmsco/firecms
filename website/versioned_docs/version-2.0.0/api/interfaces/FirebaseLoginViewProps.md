---
id: "FirebaseLoginViewProps"
title: "Interface: FirebaseLoginViewProps"
sidebar_label: "FirebaseLoginViewProps"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### additionalComponent

• `Optional` **additionalComponent**: `ReactNode`

Display this component bellow the sign-in buttons.
Useful for adding checkboxes for privacy and terms and conditions.
You may want to use it in conjunction with the `disabled` prop.

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:71](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L71)

___

### allowSkipLogin

• `Optional` **allowSkipLogin**: `boolean`

Enable the skip login button

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:42](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L42)

___

### authController

• **authController**: [`FirebaseAuthController`](../types/FirebaseAuthController.md)

Delegate holding the auth state

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:32](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L32)

___

### disableSignupScreen

• `Optional` **disableSignupScreen**: `boolean`

Prevent users from creating new users in when the `signInOptions` value
is `password`. This does not apply to the rest of login providers.

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:58](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L58)

___

### disabled

• `Optional` **disabled**: `boolean`

Disable the login buttons

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:52](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L52)

___

### firebaseApp

• **firebaseApp**: `FirebaseApp`

Firebase app this login view is accessing

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:27](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L27)

___

### logo

• `Optional` **logo**: `string`

Path to the logo displayed in the login screen

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:37](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L37)

___

### noUserComponent

• `Optional` **noUserComponent**: `ReactNode`

Display this component when no user is found a user tries to log in
when the `signInOptions` value is `password`.

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:64](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L64)

___

### notAllowedError

• `Optional` **notAllowedError**: `any`

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:73](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L73)

___

### signInOptions

• **signInOptions**: ([`FirebaseSignInProvider`](../types/FirebaseSignInProvider.md) \| [`FirebaseSignInOption`](../types/FirebaseSignInOption.md))[]

Each of the sign in options that get a custom button

#### Defined in

[lib/src/firebase_app/components/FirebaseLoginView.tsx:47](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/components/FirebaseLoginView.tsx#L47)
