---
id: "FirebaseCMSAppProps"
title: "Interface: FirebaseCMSAppProps"
sidebar_label: "FirebaseCMSAppProps"
sidebar_position: 0
custom_edit_url: null
---

Main entry point that defines the CMS configuration

## Properties

### HomePage

• `Optional` **HomePage**: `ComponentType`<{}\>

In case you need to override the home page.
You may want to use [useNavigation](../functions/useNavigation) in order to get the resolved
navigation.

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:133](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L133)

___

### LoginViewProps

• `Optional` **LoginViewProps**: `Partial`<[`FirebaseLoginViewProps`](FirebaseLoginViewProps)\>

Additional props passed to the login view. You can use this props
to disable registration in `password` mode, or to set up an additional
message.

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:150](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L150)

___

### allowSkipLogin

• `Optional` **allowSkipLogin**: `boolean`

If authentication is enabled, allow the user to access the content
without login.

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:64](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L64)

___

### authentication

• `Optional` **authentication**: `boolean` \| [`Authenticator`](../types/Authenticator)<`User`\>

Do the users need to log in to access the CMS.
You can specify an Authenticator function to discriminate which users can
access the CMS or not.
If not specified, authentication is enabled but no user restrictions
apply

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:48](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L48)

___

### baseCollectionPath

• `Optional` **baseCollectionPath**: `string`

Default path under the collection routes of the CMS will be created

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:143](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L143)

___

### basePath

• `Optional` **basePath**: `string`

Default path under the navigation routes of the CMS will be created

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:138](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L138)

___

### dateTimeFormat

• `Optional` **dateTimeFormat**: `string`

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:105](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L105)

___

### firebaseConfig

• `Optional` **firebaseConfig**: `Object`

Firebase configuration of the project. If you afe deploying the app to
Firebase hosting, you don't need to specify this value

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:70](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L70)

___

### fontFamily

• `Optional` **fontFamily**: `string`

Font family string
e.g.
'"Roboto", "Helvetica", "Arial", sans-serif'

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:94](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L94)

___

### locale

• `Optional` **locale**: [`Locale`](../types/Locale)

Locale of the CMS, currently only affecting dates

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:110](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L110)

___

### logo

• `Optional` **logo**: `string`

Logo to be displayed in the drawer of the CMS

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:29](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L29)

___

### name

• **name**: `string`

Name of the app, displayed as the main title and in the tab title

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:24](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L24)

___

### navigation

• **navigation**: [`Navigation`](Navigation) \| [`EntityCollection`](EntityCollection)<`any`, `string`, `any`\>[] \| [`NavigationBuilder`](../types/NavigationBuilder)<`User`\>

Use this prop to specify the views that will be generated in the CMS.
You usually will want to create a `Navigation` object that includes
collection views where you specify the path and the schema.
Additionally, you can add custom views to the root navigation.
In you need to customize the navigation based on the logged user you
can use a `NavigationBuilder`

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:39](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L39)

___

### primaryColor

• `Optional` **primaryColor**: `string`

Primary color of the theme of the CMS

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:82](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L82)

___

### schemaOverrideHandler

• `Optional` **schemaOverrideHandler**: [`SchemaOverrideHandler`](../types/SchemaOverrideHandler)

Used to override schemas based on the collection path and entityId.
This resolver allows to override the schema for specific entities, or
specific collections, app wide. This overrides schemas all through the app.

You can also override schemas in place, when using `useSideEntityController`

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:119](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L119)

___

### secondaryColor

• `Optional` **secondaryColor**: `string`

Secondary color of the theme of the CMS

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:87](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L87)

___

### signInOptions

• `Optional` **signInOptions**: (`FirebaseSignInProvider` \| `FirebaseSignInOption`)[]

List of sign in options that will be displayed in the login
view if `authentication` is enabled. You can pass Firebase providers strings,
such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or include addtional
config such as scopes or custom parameters
{@see FirebaseSignInOption}
Defaults to Google sign in only.

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:58](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L58)

___

### textSearchController

• `Optional` **textSearchController**: [`FirestoreTextSearchController`](../types/FirestoreTextSearchController)

Use this controller to return text search results as document ids, that
get then fetched from Firestore.

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:126](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L126)

___

### toolbarExtraWidget

• `Optional` **toolbarExtraWidget**: `ReactNode`

A component that gets rendered on the upper side of the main toolbar

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:99](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L99)

## Methods

### onFirebaseInit

▸ `Optional` **onFirebaseInit**(`config`): `void`

Optional callback after Firebase has been initialised. Useful for
using the local emulator or retrieving the used configuration.

#### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `object` |

#### Returns

`void`

#### Defined in

[firebase_app/FirebaseCMSAppProps.tsx:77](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/FirebaseCMSAppProps.tsx#L77)
