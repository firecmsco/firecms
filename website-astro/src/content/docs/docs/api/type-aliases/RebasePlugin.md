---
slug: "docs/api/type-aliases/RebasePlugin"
title: "RebasePlugin"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebasePlugin

# Type Alias: RebasePlugin\<PROPS, FORM_PROPS, EC, COL_ACTIONS_PROPS, COL_ACTIONS_START__PROPS\>

> **RebasePlugin**\<`PROPS`, `FORM_PROPS`, `EC`, `COL_ACTIONS_PROPS`, `COL_ACTIONS_START__PROPS`\> = `object`

Defined in: [types/src/types/plugins.tsx:17](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

Interface used to define plugins for Rebase.
NOTE: This is a work in progress and the API is not stable yet.

## Type Parameters

### PROPS

`PROPS` = `any`

### FORM_PROPS

`FORM_PROPS` = `any`

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection) = [`EntityCollection`](../interfaces/EntityCollection)

### COL_ACTIONS_PROPS

`COL_ACTIONS_PROPS` = `any`

### COL_ACTIONS_START__PROPS

`COL_ACTIONS_START__PROPS` = `any`

## Properties

### collection?

> `optional` **collection**: `object`

Defined in: [types/src/types/plugins.tsx:254](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

#### injectCollections()?

> `optional` **injectCollections**: (`collections`) => [`EntityCollection`](../interfaces/EntityCollection)[]

Use this method to modify, add or remove collections.

##### Parameters

###### collections

[`EntityCollection`](../interfaces/EntityCollection)[]

##### Returns

[`EntityCollection`](../interfaces/EntityCollection)[]

#### modifyCollection()?

> `optional` **modifyCollection**: (`collection`) => [`EntityCollection`](../interfaces/EntityCollection)

Use this method to modify a single collection before it is rendered.

##### Parameters

###### collection

[`EntityCollection`](../interfaces/EntityCollection)

##### Returns

[`EntityCollection`](../interfaces/EntityCollection)

***

### collectionView?

> `optional` **collectionView**: `object`

Defined in: [types/src/types/plugins.tsx:112](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

#### AddColumnComponent?

> `optional` **AddColumnComponent**: `React.ComponentType`\<\{ `collection`: `EC`; `parentCollectionIds`: `string`[]; `path`: `string`; `tableController`: [`EntityTableController`](EntityTableController); \}\>

If you add this callback to your plugin, an add button will be added to the collection table.
TODO: Only the first plugin that defines this callback will be used, at the moment.

#### AddKanbanColumnComponent?

> `optional` **AddKanbanColumnComponent**: `React.ComponentType`\<\{ `collection`: `EC`; `columnProperty`: `string`; `fullPath`: `string`; `parentCollectionIds`: `string`[]; \}\>

Component to render an "Add Column" button at the end of the Kanban board.
Used to allow adding new enum values to the column property.

#### blockSearch()?

> `optional` **blockSearch**: (`props`) => `boolean`

##### Parameters

###### props

###### collection

`EC`

###### context

[`RebaseContext`](RebaseContext)

###### parentCollectionIds?

`string`[]

###### path

`string`

##### Returns

`boolean`

#### CollectionActions?

> `optional` **CollectionActions**: `React.ComponentType`\<[`CollectionActionsProps`](../interfaces/CollectionActionsProps)\<`Record`\<`string`, `unknown`\>, [`User`](User), `EC`\> & `COL_ACTIONS_PROPS`\> \| `React.ComponentType`\<[`CollectionActionsProps`](../interfaces/CollectionActionsProps)\<`Record`\<`string`, `unknown`\>, [`User`](User), `EC`\> & `COL_ACTIONS_PROPS`\>[]

Use this component to add custom actions to the entity collections
toolbar.

#### collectionActionsProps?

> `optional` **collectionActionsProps**: `COL_ACTIONS_PROPS`

#### CollectionActionsStart?

> `optional` **CollectionActionsStart**: `React.ComponentType`\<[`CollectionActionsProps`](../interfaces/CollectionActionsProps)\<`Record`\<`string`, `unknown`\>, [`User`](User), `EC`\> & `COL_ACTIONS_START__PROPS`\> \| `React.ComponentType`\<[`CollectionActionsProps`](../interfaces/CollectionActionsProps)\<`Record`\<`string`, `unknown`\>, [`User`](User), `EC`\> & `COL_ACTIONS_START__PROPS`\>[]

#### collectionActionsStartProps?

> `optional` **collectionActionsStartProps**: `COL_ACTIONS_START__PROPS`

#### CollectionError?

> `optional` **CollectionError**: `React.ComponentType`\<\{ `collection`: `EC`; `error`: `Error`; `parentCollectionIds?`: `string`[]; `path`: `string`; \}\>

Custom component to render when a collection loading error occurs.
If provided, this replaces the default error view in all collection view modes
(table, card, kanban).
Return `null` from the component to fall back to the default error view.

#### HeaderAction?

> `optional` **HeaderAction**: `React.ComponentType`\<\{ `collection`: `EC`; `onHover`: `boolean`; `parentCollectionIds`: `string`[]; `path`: `string`; `property`: [`Property`](Property); `propertyKey`: `string`; `tableController`: [`EntityTableController`](EntityTableController); \}\>

Use this method to inject widgets to the entity collections header

##### Param

#### KanbanSetupComponent?

> `optional` **KanbanSetupComponent**: `React.ComponentType`\<\{ `collection`: `EC`; `fullPath`: `string`; `parentCollectionIds`: `string`[]; \}\>

Component to render when Kanban view is missing configuration.
Used to provide a CTA to open the collection editor to configure Kanban.

#### onColumnsReorder()?

> `optional` **onColumnsReorder**: (`props`) => `void`

Callback called when columns are reordered via drag and drop.
Used by plugins to persist the new column order.

##### Parameters

###### props

###### collection

`EC`

###### fullPath

`string`

###### newPropertiesOrder

`string`[]

###### parentCollectionIds

`string`[]

##### Returns

`void`

#### onKanbanColumnsReorder()?

> `optional` **onKanbanColumnsReorder**: (`props`) => `void`

Callback called when Kanban board columns are reordered via drag and drop.
Used by plugins to persist the new Kanban column order.

##### Parameters

###### props

###### collection

`EC`

###### fullPath

`string`

###### kanbanColumnProperty

`string`

###### newColumnsOrder

`string`[]

###### parentCollectionIds

`string`[]

##### Returns

`void`

#### onTextSearchClick()?

> `optional` **onTextSearchClick**: (`props`) => `Promise`\<`boolean`\>

##### Parameters

###### props

###### collection

`EC`

###### context

[`RebaseContext`](RebaseContext)

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

[`RebaseContext`](RebaseContext)

###### parentCollectionIds?

`string`[]

###### path

`string`

##### Returns

`boolean`

***

### form?

> `optional` **form**: `object`

Defined in: [types/src/types/plugins.tsx:228](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

#### Actions?

> `optional` **Actions**: `React.ComponentType`\<[`PluginFormActionProps`](../interfaces/PluginFormActionProps)\<[`User`](User), `EC`\>\>

Add custom actions to the default ones ("Save", "Discard"...)

#### ActionsTop?

> `optional` **ActionsTop**: `React.ComponentType`\<[`PluginFormActionProps`](../interfaces/PluginFormActionProps)\<[`User`](User), `EC`\>\>

Add custom actions to the top of the form

#### BeforeTitle?

> `optional` **BeforeTitle**: `React.ComponentType`\<[`PluginFormActionProps`](../interfaces/PluginFormActionProps)\<[`User`](User), `EC`\>\>

Add custom content above the entity title in the form view

#### fieldBuilder()?

> `optional` **fieldBuilder**: \<`T`\>(`props`) => `React.ComponentType`\<[`FieldProps`](../interfaces/FieldProps)\<`any`\>\> \| `null`

##### Type Parameters

###### T

`T`

##### Parameters

###### props

[`PluginFieldBuilderParams`](PluginFieldBuilderParams)\<`Record`\<`string`, `unknown`\>, `EC`\>

##### Returns

`React.ComponentType`\<[`FieldProps`](../interfaces/FieldProps)\<`any`\>\> \| `null`

#### fieldBuilderEnabled()?

> `optional` **fieldBuilderEnabled**: \<`T`\>(`props`) => `boolean`

##### Type Parameters

###### T

`T`

##### Parameters

###### props

[`PluginFieldBuilderParams`](PluginFieldBuilderParams)

##### Returns

`boolean`

#### provider?

> `optional` **provider**: `object`

##### provider.Component

> **Component**: `React.ComponentType`\<`PropsWithChildren`\<`FORM_PROPS` & [`PluginFormActionProps`](../interfaces/PluginFormActionProps)\<[`User`](User), `EC`\>\>\>

##### provider.props?

> `optional` **props**: `FORM_PROPS`

***

### homePage?

> `optional` **homePage**: `object`

Defined in: [types/src/types/plugins.tsx:54](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

#### additionalActions?

> `optional` **additionalActions**: `React.ReactNode`

Additional actions to be rendered in the home page, close to the search bar.

#### AdditionalCards?

> `optional` **AdditionalCards**: `React.ComponentType`\<[`PluginHomePageAdditionalCardsProps`](../interfaces/PluginHomePageAdditionalCardsProps)\> \| `React.ComponentType`\<[`PluginHomePageAdditionalCardsProps`](../interfaces/PluginHomePageAdditionalCardsProps)\>[]

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

> `optional` **CollectionActions**: `React.ComponentType`\<[`PluginHomePageActionsProps`](../interfaces/PluginHomePageActionsProps)\>

Use this component to add custom actions to the navigation card
in the home page.

#### extraProps?

> `optional` **extraProps**: `Record`\<`string`, `unknown`\>

Additional props passed to `CollectionActions`

#### includeSection()?

> `optional` **includeSection**: (`props`) => `object`

Include a section in the home page with a custom component and title.

##### Parameters

###### props

[`PluginGenericProps`](../interfaces/PluginGenericProps)

##### Returns

`object`

###### children

> **children**: `React.ReactNode`

###### title

> **title**: `string`

#### navigationEntries?

> `optional` **navigationEntries**: [`NavigationGroupMapping`](../interfaces/NavigationGroupMapping)[]

#### onNavigationEntriesUpdate()?

> `optional` **onNavigationEntriesUpdate**: (`entries`) => `void`

This method will be called when the entries are updated in the home page.
group => navigationEntriesOrder (path)

##### Parameters

###### entries

[`NavigationGroupMapping`](../interfaces/NavigationGroupMapping)[]

##### Returns

`void`

***

### key

> **key**: `string`

Defined in: [types/src/types/plugins.tsx:22](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

Key of the plugin. This is used to identify the plugin in the CMS.

***

### loading?

> `optional` **loading**: `boolean`

Defined in: [types/src/types/plugins.tsx:28](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

If this flag is set to true, no content will be shown in the CMS
until the plugin is fully loaded.

***

### provider?

> `optional` **provider**: `object`

Defined in: [types/src/types/plugins.tsx:39](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

You can use this prop to add higher order components to the CMS.
The components will be added to the root of the CMS, so any component
rendered underneath by this plugin will have access to the context
provided by this HOC.
Anyhow, this is rendered below the [RebaseContext](RebaseContext) provider, so
you can use the hooks provided by the CMS.

#### Component

> **Component**: `React.ComponentType`\<`PropsWithChildren`\<`PROPS` & `object`\>\>

#### props?

> `optional` **props**: `PROPS`

#### Param

***

### userManagement?

> `optional` **userManagement**: [`UserManagementDelegate`](../interfaces/UserManagementDelegate)

Defined in: [types/src/types/plugins.tsx:46](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### views?

> `optional` **views**: [`CMSView`](../interfaces/CMSView)[]

Defined in: [types/src/types/plugins.tsx:52](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

Views to be automatically added to the navigation.
These views will be merged with the views provided to useBuildNavigationStateController.
