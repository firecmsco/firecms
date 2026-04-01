---
slug: "docs/api/type-aliases/RebaseProps"
title: "RebaseProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebaseProps

# Type Alias: RebaseProps\<USER\>

> **RebaseProps**\<`USER`\> = `object`

Defined in: [types/src/types/rebase.tsx:59](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

## Type Parameters

### USER

`USER` *extends* [`User`](User)

## Properties

### apiKey?

> `optional` **apiKey**: `string`

Defined in: [types/src/types/rebase.tsx:82](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

If you have a custom API key, you can use it here.

***

### apiUrl?

> `optional` **apiUrl**: `string`

Defined in: [types/src/types/rebase.tsx:89](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Base URL for the backend API (e.g. "http://localhost:3001").
When provided, this is available via `useApiConfig()` to any hook
in the tree, reducing repetitive `apiUrl` threading.

***

### authController

> **authController**: [`AuthController`](AuthController)\<`USER`\>

Defined in: [types/src/types/rebase.tsx:154](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Delegate for implementing your auth operations.

***

### children()

> **children**: (`props`) => `React.ReactNode`

Defined in: [types/src/types/rebase.tsx:66](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Use this function to return the components you want to render under
Rebase

#### Parameters

##### props

###### context

[`RebaseContext`](RebaseContext)

Context of the app

###### loading

`boolean`

Is one of the main processes, auth and navigation resolving, currently
loading. If you are building your custom implementation, you probably
want to show a loading indicator if this flag is `true`

#### Returns

`React.ReactNode`

***

### cmsUrlController

> **cmsUrlController**: [`CMSUrlController`](CMSUrlController)

Defined in: [types/src/types/rebase.tsx:106](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

This controller is in charge of resolving the URL configurations map and building paths

***

### collectionRegistryController

> **collectionRegistryController**: [`CollectionRegistryController`](CollectionRegistryController)

Defined in: [types/src/types/rebase.tsx:101](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

This controller is in charge of resolving the collection and entity paths.

***

### components?

> `optional` **components**: `object`

Defined in: [types/src/types/rebase.tsx:195](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

#### missingReference?

> `optional` **missingReference**: `React.ComponentType`\<\{ `path`: `string`; \}\>

Component to render when a reference is missing

***

### dataSource

> **dataSource**: [`DataSource`](../interfaces/DataSource)

Defined in: [types/src/types/rebase.tsx:144](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Connector to your database

***

### dateTimeFormat?

> `optional` **dateTimeFormat**: `string`

Defined in: [types/src/types/rebase.tsx:134](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

***

### effectiveRoleController?

> `optional` **effectiveRoleController**: [`EffectiveRoleController`](../interfaces/EffectiveRoleController)

Defined in: [types/src/types/rebase.tsx:209](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Controller to simulate different roles when dev mode is active.

***

### entityActions?

> `optional` **entityActions**: [`EntityAction`](EntityAction)[]

Defined in: [types/src/types/rebase.tsx:128](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

List of actions that can be performed on entities.
These actions are displayed in the entity view and in the collection view.
You can later reuse these actions in the `entityActions` prop of a collection,
by specifying the `key` of the action.

***

### entityLinkBuilder?

> `optional` **entityLinkBuilder**: [`EntityLinkBuilder`](EntityLinkBuilder)

Defined in: [types/src/types/rebase.tsx:179](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Optional link builder you can add to generate a button in your entity forms.
The function must return a URL that gets opened when the button is clicked

***

### entityViews?

> `optional` **entityViews**: [`EntityCustomView`](EntityCustomView)[]

Defined in: [types/src/types/rebase.tsx:120](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

List of additional custom views for entities.
You can use the key to reference the custom view in
the `entityViews` prop of a collection.

You can also define an entity view from the UI.

***

### locale?

> `optional` **locale**: [`Locale`](Locale)

Defined in: [types/src/types/rebase.tsx:139](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Locale of the CMS, currently only affecting dates

***

### navigationStateController

> **navigationStateController**: [`NavigationStateController`](NavigationStateController)

Defined in: [types/src/types/rebase.tsx:111](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

This controller is in charge of resolving the navigation views and state

***

### onAnalyticsEvent()?

> `optional` **onAnalyticsEvent**: (`event`, `data?`) => `void`

Defined in: [types/src/types/rebase.tsx:173](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

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

> `optional` **plugins**: [`RebasePlugin`](RebasePlugin)\<`any`, `any`, `any`\>[]

Defined in: [types/src/types/rebase.tsx:168](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Use plugins to modify the behaviour of the CMS.
DEPRECATED: use the `plugins` prop in the `useBuildNavigationController` instead.
This prop will work as a fallback for the `plugins` prop in the `useBuildNavigationController`.

#### Deprecated

***

### propertyConfigs?

> `optional` **propertyConfigs**: `Record`\<`string`, [`PropertyConfig`](PropertyConfig)\>

Defined in: [types/src/types/rebase.tsx:96](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Record of custom form fields to be used in the CMS.
You can use the key to reference the custom field in
the `propertyConfig` prop of a property in a collection.

***

### storageSource

> **storageSource**: [`StorageSource`](../interfaces/StorageSource)

Defined in: [types/src/types/rebase.tsx:149](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Connector to your file upload/fetch implementation

***

### userConfigPersistence?

> `optional` **userConfigPersistence**: [`UserConfigurationPersistence`](../interfaces/UserConfigurationPersistence)

Defined in: [types/src/types/rebase.tsx:160](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

Use this controller to access the configuration that is stored locally,
and not defined in code

***

### userManagement?

> `optional` **userManagement**: [`UserManagementDelegate`](../interfaces/UserManagementDelegate)

Defined in: [types/src/types/rebase.tsx:193](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/rebase.tsx)

You can use this props to provide your own user management implementation.
Note that this will not affect the UI, but it will be used to show user information
in various places of the CMS, for example, to show who created or modified an entity,
or to assign ownership of an entity.

You can also use this data to be retrieved in your custom properties,
for example, to show a list of users in a dropdown.

If you are using the Rebase user management plugin, this
prop will be implemented automatically.
