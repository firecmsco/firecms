---
slug: "docs/api/type-aliases/BuildNavigationStateProps"
title: "BuildNavigationStateProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / BuildNavigationStateProps

# Type Alias: BuildNavigationStateProps\<EC, USER\>

> **BuildNavigationStateProps**\<`EC`, `USER`\> = `object`

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:26](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection)

### USER

`USER` *extends* [`User`](User)

## Properties

### adminMode?

> `optional` **adminMode**: `"content"` \| `"studio"` \| `"settings"`

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:38](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### adminViews?

> `optional` **adminViews**: [`CMSView`](../interfaces/CMSView)[] \| [`CMSViewsBuilder`](CMSViewsBuilder)

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:30](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### authController

> **authController**: [`AuthController`](AuthController)\<`USER`\>

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:27](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### cmsUrlController

> **cmsUrlController**: [`CMSUrlController`](CMSUrlController)

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:37](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### collectionRegistryController

> **collectionRegistryController**: [`CollectionRegistryController`](CollectionRegistryController)\<`EC`\> & `object`

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:36](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

#### Type Declaration

##### collectionRegistryRef

> **collectionRegistryRef**: `React.MutableRefObject`\<[`CollectionRegistry`](../classes/CollectionRegistry)\>

***

### collections?

> `optional` **collections**: `EC`[] \| [`EntityCollectionsBuilder`](EntityCollectionsBuilder)\<`EC`\>

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:28](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### dataSource

> **dataSource**: [`DataSource`](../interfaces/DataSource)

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:31](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:34](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### effectiveRoleController?

> `optional` **effectiveRoleController**: [`EffectiveRoleController`](../interfaces/EffectiveRoleController)

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:39](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### navigationGroupMappings?

> `optional` **navigationGroupMappings**: [`NavigationGroupMapping`](../interfaces/NavigationGroupMapping)[]

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:33](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### plugins?

> `optional` **plugins**: [`RebasePlugin`](RebasePlugin)[]

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:32](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### userManagement?

> `optional` **userManagement**: [`UserManagementDelegate`](../interfaces/UserManagementDelegate)\<`USER`\>

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:40](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### views?

> `optional` **views**: [`CMSView`](../interfaces/CMSView)[] \| [`CMSViewsBuilder`](CMSViewsBuilder)

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:29](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)

***

### viewsOrder?

> `optional` **viewsOrder**: `string`[]

Defined in: [core/src/hooks/navigation/useBuildNavigationStateController.tsx:35](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useBuildNavigationStateController.tsx)
