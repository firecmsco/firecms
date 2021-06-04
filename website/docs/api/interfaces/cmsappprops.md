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

[CMSAppProps.tsx:56](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L56)

___

### authentication

• `Optional` **authentication**: `boolean` \| [Authenticator](../types/authenticator.md)

Do the users need to log in to access the CMS.
You can specify an Authenticator function to discriminate which users can
access the CMS or not.
If not specified, authentication is enabled but no user restrictions
apply

#### Defined in

[CMSAppProps.tsx:41](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L41)

___

### dateTimeFormat

• `Optional` **dateTimeFormat**: `string`

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

#### Defined in

[CMSAppProps.tsx:97](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L97)

___

### firebaseConfig

• `Optional` **firebaseConfig**: `Object`

Firebase configuration of the project. If you afe deploying the app to
Firebase hosting, you don't need to specify this value

#### Defined in

[CMSAppProps.tsx:62](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L62)

___

### fontFamily

• `Optional` **fontFamily**: `string`

Font family string
e.g.
'"Roboto", "Helvetica", "Arial", sans-serif'

#### Defined in

[CMSAppProps.tsx:86](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L86)

___

### locale

• `Optional` **locale**: [Locale](../types/locale.md)

Locale of the CMS, currently only affecting dates

#### Defined in

[CMSAppProps.tsx:102](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L102)

___

### logo

• `Optional` **logo**: `string`

Logo to be displayed in the drawer of the CMS

#### Defined in

[CMSAppProps.tsx:22](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L22)

___

### name

• **name**: `string`

Name of the app, displayed as the main title and in the tab title

#### Defined in

[CMSAppProps.tsx:17](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L17)

___

### navigation

• **navigation**: [EntityCollectionView](entitycollectionview.md)<[EntitySchema](entityschema.md)<any, any\>, any, string\>[] \| [Navigation](navigation.md) \| [NavigationBuilder](../types/navigationbuilder.md)

Use this prop to specify the views that will be generated in the CMS.
You usually will want to create a `Navigation` object that includes
collection views where you specify the path and the schema.
Additionally you can add custom views to the root navigation.
In you need to customize the navigation based on the logged user you
can use a `NavigationBuilder`

#### Defined in

[CMSAppProps.tsx:32](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L32)

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

[CMSAppProps.tsx:69](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L69)

___

### primaryColor

• `Optional` **primaryColor**: `string`

Primary color of the theme of the CMS

#### Defined in

[CMSAppProps.tsx:74](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L74)

___

### schemaResolver

• `Optional` **schemaResolver**: [SchemaResolver](../types/schemaresolver.md)

Used to override schemas based on the collection path and entityId.
This resolver allows to override the schema for specific entities, or
specific collections, app wide. This overrides schemas all through the app.

You can also override schemas in place, when using `useSideEntityController`

#### Defined in

[CMSAppProps.tsx:111](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L111)

___

### secondaryColor

• `Optional` **secondaryColor**: `string`

Secondary color of the theme of the CMS

#### Defined in

[CMSAppProps.tsx:79](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L79)

___

### signInOptions

• `Optional` **signInOptions**: `any`[]

List of sign in options that will be displayed in the login
view if `authentication` is enabled. You can pass google providers strings,
such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or full configuration
objects such as specified in https://firebase.google.com/docs/auth/web/firebaseui
Defaults to Google sign in only.

#### Defined in

[CMSAppProps.tsx:50](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L50)

___

### toolbarExtraWidget

• `Optional` **toolbarExtraWidget**: `ReactNode`

A component that gets rendered on the upper side of the main toolbar

#### Defined in

[CMSAppProps.tsx:91](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProps.tsx#L91)
