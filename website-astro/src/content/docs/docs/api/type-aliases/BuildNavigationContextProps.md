---
slug: "docs/api/type-aliases/BuildNavigationContextProps"
title: "BuildNavigationContextProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / BuildNavigationContextProps

# Type Alias: BuildNavigationContextProps\<EC, USER\>

> **BuildNavigationContextProps**\<`EC`, `USER`\> = `object`

Defined in: [core/src/hooks/useBuildNavigationController.tsx:27](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection)

### USER

`USER` *extends* [`User`](User)

## Properties

### adminViews?

> `optional` **adminViews**: [`CMSView`](../interfaces/CMSView)[] \| [`CMSViewsBuilder`](CMSViewsBuilder)

Defined in: [core/src/hooks/useBuildNavigationController.tsx:33](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### authController

> **authController**: [`AuthController`](AuthController)\<`USER`\>

Defined in: [core/src/hooks/useBuildNavigationController.tsx:30](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### baseCollectionPath?

> `optional` **baseCollectionPath**: `string`

Defined in: [core/src/hooks/useBuildNavigationController.tsx:29](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### basePath?

> `optional` **basePath**: `string`

Defined in: [core/src/hooks/useBuildNavigationController.tsx:28](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### collections?

> `optional` **collections**: `EC`[] \| [`EntityCollectionsBuilder`](EntityCollectionsBuilder)\<`EC`\>

Defined in: [core/src/hooks/useBuildNavigationController.tsx:31](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### dataSource

> **dataSource**: [`DataSource`](../interfaces/DataSource)

Defined in: [core/src/hooks/useBuildNavigationController.tsx:35](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/src/hooks/useBuildNavigationController.tsx:38](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### navigationGroupMappings?

> `optional` **navigationGroupMappings**: [`NavigationGroupMapping`](../interfaces/NavigationGroupMapping)[]

Defined in: [core/src/hooks/useBuildNavigationController.tsx:37](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### plugins?

> `optional` **plugins**: [`RebasePlugin`](RebasePlugin)[]

Defined in: [core/src/hooks/useBuildNavigationController.tsx:36](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### userConfigPersistence?

> `optional` **userConfigPersistence**: [`UserConfigurationPersistence`](../interfaces/UserConfigurationPersistence)

Defined in: [core/src/hooks/useBuildNavigationController.tsx:34](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### views?

> `optional` **views**: [`CMSView`](../interfaces/CMSView)[] \| [`CMSViewsBuilder`](CMSViewsBuilder)

Defined in: [core/src/hooks/useBuildNavigationController.tsx:32](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)

***

### viewsOrder?

> `optional` **viewsOrder**: `string`[]

Defined in: [core/src/hooks/useBuildNavigationController.tsx:39](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/useBuildNavigationController.tsx)
