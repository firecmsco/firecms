---
slug: "docs/api/type-aliases/FireCMSPlugin"
title: "FireCMSPlugin"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / FireCMSPlugin

# Type Alias: FireCMSPlugin\<PROPS, FORM_PROPS, EC, COL_ACTIONS_PROPS, COL_ACTIONS_START__PROPS\>

> **FireCMSPlugin**\<`PROPS`, `FORM_PROPS`, `EC`, `COL_ACTIONS_PROPS`, `COL_ACTIONS_START__PROPS`\> = `object`

Defined in: [types/plugins.tsx:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

Interface used to define plugins for FireCMS.
NOTE: This is a work in progress and the API is not stable yet.

## Type Parameters

### PROPS

`PROPS` = `any`

### FORM_PROPS

`FORM_PROPS` = `any`

### EC

`EC` *extends* [`EntityCollection`](/docs/api/interfaces/EntityCollection) = [`EntityCollection`](/docs/api/interfaces/EntityCollection)

### COL_ACTIONS_PROPS

`COL_ACTIONS_PROPS` = `any`

### COL_ACTIONS_START__PROPS

`COL_ACTIONS_START__PROPS` = `any`

## Properties

### collection?

> `optional` **collection**: `object`

Defined in: [types/plugins.tsx:187](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

#### injectCollections()?

> `optional` **injectCollections**: (`collections`) => [`EntityCollection`](/docs/api/interfaces/EntityCollection)[]

Use this method to modify, add or remove collections.

##### Parameters

###### collections

[`EntityCollection`](/docs/api/interfaces/EntityCollection)[]

##### Returns

[`EntityCollection`](/docs/api/interfaces/EntityCollection)[]

#### modifyCollection()?

> `optional` **modifyCollection**: (`collection`) => [`EntityCollection`](/docs/api/interfaces/EntityCollection)

Use this method to modify a single collection before it is rendered.

##### Parameters

###### collection

[`EntityCollection`](/docs/api/interfaces/EntityCollection)

##### Returns

[`EntityCollection`](/docs/api/interfaces/EntityCollection)

***

### collectionView?

> `optional` **collectionView**: `object`

Defined in: [types/plugins.tsx:107](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

#### AddColumnComponent?

> `optional` **AddColumnComponent**: `React.ComponentType`\<\{ `collection`: `EC`; `fullPath`: `string`; `parentCollectionIds`: `string`[]; `tableController`: [`EntityTableController`](/docs/api/type-aliases/EntityTableController); \}\>

If you add this callback to your plugin, an add button will be added to the collection table.
TODO: Only the first plugin that defines this callback will be used, at the moment.

#### blockSearch()?

> `optional` **blockSearch**: (`props`) => `boolean`

##### Parameters

###### props

###### collection

`EC`

###### context

[`FireCMSContext`](/docs/api/type-aliases/FireCMSContext)

###### parentCollectionIds?

`string`[]

###### path

`string`

##### Returns

`boolean`

#### CollectionActions?

> `optional` **CollectionActions**: `React.ComponentType`\<[`CollectionActionsProps`](/docs/api/interfaces/CollectionActionsProps)\<`any`, `any`, `EC`\> & `COL_ACTIONS_PROPS`\> \| `React.ComponentType`\<[`CollectionActionsProps`](/docs/api/interfaces/CollectionActionsProps)\<`any`, `any`, `EC`\> & `COL_ACTIONS_PROPS`\>[]

Use this component to add custom actions to the entity collections
toolbar.

#### collectionActionsProps?

> `optional` **collectionActionsProps**: `COL_ACTIONS_PROPS`

#### CollectionActionsStart?

> `optional` **CollectionActionsStart**: `React.ComponentType`\<[`CollectionActionsProps`](/docs/api/interfaces/CollectionActionsProps)\<`any`, `any`, `EC`\> & `COL_ACTIONS_START__PROPS`\> \| `React.ComponentType`\<[`CollectionActionsProps`](/docs/api/interfaces/CollectionActionsProps)\<`any`, `any`, `EC`\> & `COL_ACTIONS_START__PROPS`\>[]

#### collectionActionsStartProps?

> `optional` **collectionActionsStartProps**: `COL_ACTIONS_START__PROPS`

#### HeaderAction?

> `optional` **HeaderAction**: `React.ComponentType`\<\{ `collection`: `EC`; `fullPath`: `string`; `onHover`: `boolean`; `parentCollectionIds`: `string`[]; `property`: [`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty); `propertyKey`: `string`; `tableController`: [`EntityTableController`](/docs/api/type-aliases/EntityTableController); \}\>

Use this method to inject widgets to the entity collections header

##### Param

#### onTextSearchClick()?

> `optional` **onTextSearchClick**: (`props`) => `Promise`\<`boolean`\>

##### Parameters

###### props

###### collection

`EC`

###### context

[`FireCMSContext`](/docs/api/type-aliases/FireCMSContext)

###### parentCollectionIds?

`string`[]

###### path

`string`

##### Returns

`Promise`\<`boolean`\>

#### showTextSearchBar()?

> `optional` **showTextSearchBar**: (`props`) => `boolean`

##### Parameters

###### props

###### collection

`EC`

###### context

[`FireCMSContext`](/docs/api/type-aliases/FireCMSContext)

###### parentCollectionIds?

`string`[]

###### path

`string`

##### Returns

`boolean`

***

### form?

> `optional` **form**: `object`

Defined in: [types/plugins.tsx:166](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

#### Actions?

> `optional` **Actions**: `React.ComponentType`\<[`PluginFormActionProps`](/docs/api/interfaces/PluginFormActionProps)\<`any`, `EC`\>\>

Add custom actions to the default ones ("Save", "Discard"...)

#### ActionsTop?

> `optional` **ActionsTop**: `React.ComponentType`\<[`PluginFormActionProps`](/docs/api/interfaces/PluginFormActionProps)\<`any`, `EC`\>\>

Add custom actions to the top of the form

#### fieldBuilder()?

> `optional` **fieldBuilder**: \<`T`\>(`props`) => `React.ComponentType`\<[`FieldProps`](/docs/api/interfaces/FieldProps)\<`T`\>\> \| `null`

##### Type Parameters

###### T

`T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = [`CMSType`](/docs/api/type-aliases/CMSType)

##### Parameters

###### props

[`PluginFieldBuilderParams`](/docs/api/type-aliases/PluginFieldBuilderParams)\<`T`, `any`, `EC`\>

##### Returns

`React.ComponentType`\<[`FieldProps`](/docs/api/interfaces/FieldProps)\<`T`\>\> \| `null`

#### fieldBuilderEnabled()?

> `optional` **fieldBuilderEnabled**: \<`T`\>(`props`) => `boolean`

##### Type Parameters

###### T

`T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = [`CMSType`](/docs/api/type-aliases/CMSType)

##### Parameters

###### props

[`PluginFieldBuilderParams`](/docs/api/type-aliases/PluginFieldBuilderParams)\<`T`\>

##### Returns

`boolean`

#### provider?

> `optional` **provider**: `object`

##### provider.Component

> **Component**: `React.ComponentType`\<`PropsWithChildren`\<`FORM_PROPS` & [`PluginFormActionProps`](/docs/api/interfaces/PluginFormActionProps)\<`any`, `EC`\>\>\>

##### provider.props?

> `optional` **props**: `FORM_PROPS`

***

### homePage?

> `optional` **homePage**: `object`

Defined in: [types/plugins.tsx:49](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

#### additionalActions?

> `optional` **additionalActions**: `React.ReactNode`

Additional actions to be rendered in the home page, close to the search bar.

#### AdditionalCards?

> `optional` **AdditionalCards**: `React.ComponentType`\<[`PluginHomePageAdditionalCardsProps`](/docs/api/interfaces/PluginHomePageAdditionalCardsProps)\> \| `React.ComponentType`\<[`PluginHomePageAdditionalCardsProps`](/docs/api/interfaces/PluginHomePageAdditionalCardsProps)\>[]

Add additional cards to each collection group in the home page.

#### additionalChildrenEnd?

> `optional` **additionalChildrenEnd**: `React.ReactNode`

Additional children to be rendered at the end of the home page.

#### additionalChildrenStart?

> `optional` **additionalChildrenStart**: `React.ReactNode`

Additional children to be rendered in the beginning of the home page.

#### allowDragAndDrop?

> `optional` **allowDragAndDrop**: `boolean`

Allow reordering with drag and drop of the collections in the home page.

#### CollectionActions?

> `optional` **CollectionActions**: `React.ComponentType`\<[`PluginHomePageActionsProps`](/docs/api/interfaces/PluginHomePageActionsProps)\>

Use this component to add custom actions to the navigation card
in the home page.

#### extraProps?

> `optional` **extraProps**: `any`

Additional props passed to `CollectionActions`

#### includeSection()?

> `optional` **includeSection**: (`props`) => `object`

Include a section in the home page with a custom component and title.

##### Parameters

###### props

[`PluginGenericProps`](/docs/api/interfaces/PluginGenericProps)

##### Returns

`object`

###### children

> **children**: `React.ReactNode`

###### title

> **title**: `string`

#### navigationEntries?

> `optional` **navigationEntries**: [`NavigationGroupMapping`](/docs/api/interfaces/NavigationGroupMapping)[]

#### onNavigationEntriesUpdate()?

> `optional` **onNavigationEntriesUpdate**: (`entries`) => `void`

This method will be called when the entries are updated in the home page.
group => navigationEntriesOrder (path)

##### Parameters

###### entries

[`NavigationGroupMapping`](/docs/api/interfaces/NavigationGroupMapping)[]

##### Returns

`void`

***

### key

> **key**: `string`

Defined in: [types/plugins.tsx:23](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

Key of the plugin. This is used to identify the plugin in the CMS.

***

### loading?

> `optional` **loading**: `boolean`

Defined in: [types/plugins.tsx:29](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

If this flag is set to true, no content will be shown in the CMS
until the plugin is fully loaded.

***

### provider?

> `optional` **provider**: `object`

Defined in: [types/plugins.tsx:40](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

You can use this prop to add higher order components to the CMS.
The components will be added to the root of the CMS, so any component
rendered underneath by this plugin will have access to the context
provided by this HOC.
Anyhow, this is rendered below the [FireCMSContext](/docs/api/type-aliases/FireCMSContext) provider, so
you can use the hooks provided by the CMS.

#### Component

> **Component**: `React.ComponentType`\<`PropsWithChildren`\<`PROPS` & `object`\>\>

#### props?

> `optional` **props**: `PROPS`

#### Param

***

### userManagement?

> `optional` **userManagement**: [`InternalUserManagement`](/docs/api/type-aliases/InternalUserManagement)

Defined in: [types/plugins.tsx:47](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)
