---
id: "cmsappproviderprops"
title: "Interface: CMSAppProviderProps"
sidebar_label: "CMSAppProviderProps"
sidebar_position: 0
custom_edit_url: null
---

Main entry point that defines the CMS configuration

## Properties

### authentication

• `Optional` **authentication**: `boolean` \| [Authenticator](../types/authenticator.md)

Do the users need to log in to access the CMS.
You can specify an Authenticator function to discriminate which users can
access the CMS or not.
If not specified, authentication is enabled but no user restrictions
apply

#### Defined in

[CMSAppProvider.tsx:54](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L54)

___

### dateTimeFormat

• `Optional` **dateTimeFormat**: `string`

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

#### Defined in

[CMSAppProvider.tsx:84](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L84)

___

### firebaseConfig

• **firebaseConfig**: `Object`

Firebase configuration of the project. This component is not in charge
of initialising Firebase and expects it to be already initialised.

#### Defined in

[CMSAppProvider.tsx:69](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L69)

___

### fontFamily

• `Optional` **fontFamily**: `string`

Font family string
e.g.
'"Roboto", "Helvetica", "Arial", sans-serif'

#### Defined in

[CMSAppProvider.tsx:106](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L106)

___

### locale

• `Optional` **locale**: [Locale](../types/locale.md)

Locale of the CMS, currently only affecting dates

#### Defined in

[CMSAppProvider.tsx:89](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L89)

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

[CMSAppProvider.tsx:45](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L45)

___

### primaryColor

• `Optional` **primaryColor**: `string`

Primary color of the theme of the CMS

#### Defined in

[CMSAppProvider.tsx:94](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L94)

___

### schemaResolver

• `Optional` **schemaResolver**: [SchemaResolver](../types/schemaresolver.md)

Used to override schemas based on the collection path and entityId.
This resolver allows to override the schema for specific entities, or
specific collections, app wide. This overrides schemas all through the app.

You can also override schemas in place, when using `useSideEntityController`

#### Defined in

[CMSAppProvider.tsx:78](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L78)

___

### secondaryColor

• `Optional` **secondaryColor**: `string`

Secondary color of the theme of the CMS

#### Defined in

[CMSAppProvider.tsx:99](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L99)

___

### signInOptions

• `Optional` **signInOptions**: `any`[]

List of sign in options that will be displayed in the login
view if `authentication` is enabled. You can pass google providers strings,
such as `firebase.auth.GoogleAuthProvider.PROVIDER_ID` or full configuration
objects such as specified in https://firebase.google.com/docs/auth/web/firebaseui
Defaults to Google sign in only.

#### Defined in

[CMSAppProvider.tsx:63](https://github.com/Camberi/firecms/blob/42dd384/src/CMSAppProvider.tsx#L63)
