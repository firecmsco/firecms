---
id: "cmsappprops"
title: "Interface: CMSAppProps"
sidebar_label: "CMSAppProps"
sidebar_position: 0
custom_edit_url: null
---

Main entry point that defines the CMS configuration

## Properties

### allowSkipLogin

• `Optional` **allowSkipLogin**: `boolean`

If authentication is enabled, allow the user to access the content
without login.

#### Defined in

[core/CMSAppProps.tsx:60](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L60)

___

### authentication

• `Optional` **authentication**: `boolean` \| [Authenticator](../types/authenticator.md)

Do the users need to log in to access the CMS.
You can specify an Authenticator function to discriminate which users can
access the CMS or not.
If not specified, authentication is enabled but no user restrictions
apply

#### Defined in

[core/CMSAppProps.tsx:45](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L45)

___

### dateTimeFormat

• `Optional` **dateTimeFormat**: `string`

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

#### Defined in

[core/CMSAppProps.tsx:101](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L101)

___

### firebaseConfig

• `Optional` **firebaseConfig**: `Object`

Firebase configuration of the project. If you afe deploying the app to
Firebase hosting, you don't need to specify this value

#### Defined in

[core/CMSAppProps.tsx:66](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L66)

___

### fontFamily

• `Optional` **fontFamily**: `string`

Font family string
e.g.
'"Roboto", "Helvetica", "Arial", sans-serif'

#### Defined in

[core/CMSAppProps.tsx:90](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L90)

___

### locale

• `Optional` **locale**: [Locale](../types/locale.md)

Locale of the CMS, currently only affecting dates

#### Defined in

[core/CMSAppProps.tsx:106](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L106)

___

### logo

• `Optional` **logo**: `string`

Logo to be displayed in the drawer of the CMS

#### Defined in

[core/CMSAppProps.tsx:26](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L26)

___

### name

• **name**: `string`

Name of the app, displayed as the main title and in the tab title

#### Defined in

[core/CMSAppProps.tsx:21](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L21)

___

### navigation

• **navigation**: [EntityCollectionView](entitycollectionview.md)<[EntitySchema](entityschema.md)<any\>, any, string\>[] \| [Navigation](navigation.md) \| [NavigationBuilder](../types/navigationbuilder.md)

Use this prop to specify the views that will be generated in the CMS.
You usually will want to create a `Navigation` object that includes
collection views where you specify the path and the schema.
Additionally you can add custom views to the root navigation.
In you need to customize the navigation based on the logged user you
can use a `NavigationBuilder`

#### Defined in

[core/CMSAppProps.tsx:36](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L36)

___

### onFirebaseInit

• `Optional` **onFirebaseInit**: (`config`: `object`) => `void`

Optional callback after Firebase has been initialised. Useful for
using the local emulator or retrieving the used configuration.

**`param`**

#### Type declaration

▸ (`config`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `config` | `object` |

##### Returns

`void`

#### Defined in

[core/CMSAppProps.tsx:73](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L73)

___

### primaryColor

• `Optional` **primaryColor**: `string`

Primary color of the theme of the CMS

#### Defined in

[core/CMSAppProps.tsx:78](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L78)

___

### schemaResolver

• `Optional` **schemaResolver**: [SchemaResolver](../types/schemaresolver.md)

Used to override schemas based on the collection path and entityId.
This resolver allows to override the schema for specific entities, or
specific collections, app wide. This overrides schemas all through the app.

You can also override schemas in place, when using `useSideEntityController`

#### Defined in

[core/CMSAppProps.tsx:115](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L115)

___

### secondaryColor

• `Optional` **secondaryColor**: `string`

Secondary color of the theme of the CMS

#### Defined in

[core/CMSAppProps.tsx:83](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L83)

___

### signInOptions

• `Optional` **signInOptions**: `any`[]

List of sign in options that will be displayed in the login
view if `authentication` is enabled. You can pass google providers strings,
such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or full configuration
objects such as specified in https://firebase.google.com/docs/auth/web/firebaseui
Defaults to Google sign in only.

#### Defined in

[core/CMSAppProps.tsx:54](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L54)

___

### toolbarExtraWidget

• `Optional` **toolbarExtraWidget**: `ReactNode`

A component that gets rendered on the upper side of the main toolbar

#### Defined in

[core/CMSAppProps.tsx:95](https://github.com/Camberi/firecms/blob/b1328ad/src/core/CMSAppProps.tsx#L95)
