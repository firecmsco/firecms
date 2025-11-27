---
slug: "docs/api/type-aliases/FireCMSProps"
title: "FireCMSProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / FireCMSProps

# Type Alias: FireCMSProps\<USER\>

> **FireCMSProps**\<`USER`\> = `object`

Defined in: [types/firecms.tsx:52](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

## Type Parameters

### USER

`USER` *extends* [`User`](User)

## Properties

### apiKey?

> `optional` **apiKey**: `string`

Defined in: [types/firecms.tsx:75](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

If you have a custom API key, you can use it here.

***

### authController

> **authController**: [`AuthController`](AuthController)\<`USER`\>

Defined in: [types/firecms.tsx:131](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Delegate for implementing your auth operations.

***

### children()

> **children**: (`props`) => `React.ReactNode`

Defined in: [types/firecms.tsx:59](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Use this function to return the components you want to render under
FireCMS

#### Parameters

##### props

###### context

[`FireCMSContext`](FireCMSContext)

Context of the app

###### loading

`boolean`

Is one of the main processes, auth and navigation resolving, currently
loading. If you are building your custom implementation, you probably
want to show a loading indicator if this flag is `true`

#### Returns

`React.ReactNode`

***

### components?

> `optional` **components**: `object`

Defined in: [types/firecms.tsx:172](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

#### missingReference?

> `optional` **missingReference**: `React.ComponentType`\<\{ `path`: `string`; \}\>

Component to render when a reference is missing

***

### dataSourceDelegate

> **dataSourceDelegate**: [`DataSourceDelegate`](../interfaces/DataSourceDelegate)

Defined in: [types/firecms.tsx:121](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Connector to your database

***

### dateTimeFormat?

> `optional` **dateTimeFormat**: `string`

Defined in: [types/firecms.tsx:111](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

***

### entityActions?

> `optional` **entityActions**: [`EntityAction`](EntityAction)[]

Defined in: [types/firecms.tsx:105](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

List of actions that can be performed on entities.
These actions are displayed in the entity view and in the collection view.
You can later reuse these actions in the `entityActions` prop of a collection,
by specifying the `key` of the action.

***

### entityLinkBuilder?

> `optional` **entityLinkBuilder**: [`EntityLinkBuilder`](EntityLinkBuilder)

Defined in: [types/firecms.tsx:156](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Optional link builder you can add to generate a button in your entity forms.
The function must return a URL that gets opened when the button is clicked

***

### entityViews?

> `optional` **entityViews**: [`EntityCustomView`](EntityCustomView)[]

Defined in: [types/firecms.tsx:97](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

List of additional custom views for entities.
You can use the key to reference the custom view in
the `entityViews` prop of a collection.

You can also define an entity view from the UI.

***

### locale?

> `optional` **locale**: [`Locale`](Locale)

Defined in: [types/firecms.tsx:116](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Locale of the CMS, currently only affecting dates

***

### navigationController

> **navigationController**: [`NavigationController`](NavigationController)

Defined in: [types/firecms.tsx:88](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

This controller is in charge of the navigation of the CMS.
It is in charge of resolving the collection and entity paths.

***

### onAnalyticsEvent()?

> `optional` **onAnalyticsEvent**: (`event`, `data?`) => `void`

Defined in: [types/firecms.tsx:150](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Callback used to get analytics events from the CMS

#### Parameters

##### event

[`CMSAnalyticsEvent`](CMSAnalyticsEvent)

##### data?

`object`

#### Returns

`void`

***

### ~~plugins?~~

> `optional` **plugins**: [`FireCMSPlugin`](FireCMSPlugin)\<`any`, `any`, `any`\>[]

Defined in: [types/firecms.tsx:145](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Use plugins to modify the behaviour of the CMS.
DEPRECATED: use the `plugins` prop in the `useBuildNavigationController` instead.
This prop will work as a fallback for the `plugins` prop in the `useBuildNavigationController`.

#### Deprecated

***

### propertyConfigs?

> `optional` **propertyConfigs**: `Record`\<`string`, [`PropertyConfig`](PropertyConfig)\>

Defined in: [types/firecms.tsx:82](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Record of custom form fields to be used in the CMS.
You can use the key to reference the custom field in
the `propertyConfig` prop of a property in a collection.

***

### storageSource

> **storageSource**: [`StorageSource`](../interfaces/StorageSource)

Defined in: [types/firecms.tsx:126](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Connector to your file upload/fetch implementation

***

### userConfigPersistence?

> `optional` **userConfigPersistence**: [`UserConfigurationPersistence`](../interfaces/UserConfigurationPersistence)

Defined in: [types/firecms.tsx:137](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

Use this controller to access the configuration that is stored locally,
and not defined in code

***

### userManagement?

> `optional` **userManagement**: [`InternalUserManagement`](InternalUserManagement)

Defined in: [types/firecms.tsx:170](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms.tsx)

You can use this props to provide your own user management implementation.
Note that this will not affect the UI, but it will be used to show user information
in various places of the CMS, for example, to show who created or modified an entity,
or to assign ownership of an entity.

You can also use this data to be retrieved in your custom properties,
for example, to show a list of users in a dropdown.

If you are using the FireCMS user management plugin, this
prop will be implemented automatically.
