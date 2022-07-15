---
id: "FireCMSProps"
title: "Interface: FireCMSProps<UserType>"
sidebar_label: "FireCMSProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name |
| :------ |
| `UserType` |

## Properties

### authDelegate

• **authDelegate**: [`AuthDelegate`](../types/AuthDelegate)<`any`\>

Delegate for implementing your auth operations.

**`see`** useFirebaseAuthDelegate

#### Defined in

[core/FireCMS.tsx:114](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L114)

___

### authentication

• `Optional` **authentication**: `boolean` \| [`Authenticator`](../types/Authenticator)<`UserType`\>

Do the users need to log in to access the CMS.
You can specify an Authenticator function to discriminate which users can
access the CMS or not.
If not specified, authentication is enabled but no user restrictions
apply.

#### Defined in

[core/FireCMS.tsx:76](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L76)

___

### baseCollectionPath

• `Optional` **baseCollectionPath**: `string`

Default path under the collection routes of the CMS will be created

#### Defined in

[core/FireCMS.tsx:130](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L130)

___

### basePath

• `Optional` **basePath**: `string`

Default path under the navigation routes of the CMS will be created

#### Defined in

[core/FireCMS.tsx:125](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L125)

___

### dataSource

• **dataSource**: [`DataSource`](DataSource)

Connector to your database

#### Defined in

[core/FireCMS.tsx:103](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L103)

___

### dateTimeFormat

• `Optional` **dateTimeFormat**: `string`

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

#### Defined in

[core/FireCMS.tsx:93](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L93)

___

### entityLinkBuilder

• `Optional` **entityLinkBuilder**: [`EntityLinkBuilder`](../types/EntityLinkBuilder)<`any`\>

Optional link builder you can add to generate a button in your entity forms.
The function must return a URL that gets opened when the button is clicked

#### Defined in

[core/FireCMS.tsx:120](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L120)

___

### locale

• `Optional` **locale**: [`Locale`](../types/Locale)

Locale of the CMS, currently only affecting dates

#### Defined in

[core/FireCMS.tsx:98](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L98)

___

### navigation

• **navigation**: [`Navigation`](Navigation) \| [`NavigationBuilder`](../types/NavigationBuilder)<`UserType`\> \| [`EntityCollection`](EntityCollection)<`any`, `string`, `any`\>[]

Use this prop to specify the views that will be generated in the CMS.
You usually will want to create a `Navigation` object that includes
collection views where you specify the path and the schema.
Additionally you can add custom views to the root navigation.
In you need to customize the navigation based on the logged user you
can use a `NavigationBuilder`

#### Defined in

[core/FireCMS.tsx:67](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L67)

___

### schemaOverrideHandler

• `Optional` **schemaOverrideHandler**: [`SchemaOverrideHandler`](../types/SchemaOverrideHandler)

Used to override schemas based on the collection path and entityId.
This resolver allows to override the schema for specific entities, or
specific collections, app wide.

This overrides schemas **all through the app.**

You can also override schemas in place, when using [useSideEntityController](../functions/useSideEntityController)

#### Defined in

[core/FireCMS.tsx:87](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L87)

___

### storageSource

• **storageSource**: [`StorageSource`](StorageSource)

Connector to your file upload/fetch implementation

#### Defined in

[core/FireCMS.tsx:108](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L108)

## Methods

### children

▸ **children**(`props`): `ReactNode`

Use this function to return the components you want to render under
FireCMS

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `props` | `Object` |  |
| `props.context` | [`FireCMSContext`](FireCMSContext)<`any`\> | Context of the app |
| `props.loading` | `boolean` | Is one of the main processes, auth and navigation resolving, currently loading. If you are building your custom implementation, you probably want to show a loading indicator if this flag is `true` |
| `props.mode` | ``"dark"`` \| ``"light"`` | Main color scheme |

#### Returns

`ReactNode`

#### Defined in

[core/FireCMS.tsx:42](https://github.com/Camberi/firecms/blob/2d60fba/src/core/FireCMS.tsx#L42)
