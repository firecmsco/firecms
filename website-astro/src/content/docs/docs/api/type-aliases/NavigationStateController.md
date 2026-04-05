---
slug: "docs/api/type-aliases/NavigationStateController"
title: "NavigationStateController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / NavigationStateController

# Type Alias: NavigationStateController

> **NavigationStateController** = `object`

Defined in: [types/src/controllers/navigation.ts:76](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Controller that manages the state of the navigation menu,
including resolved views and top-level grouping.

## Properties

### adminViews?

> `optional` **adminViews**: [`CMSView`](../interfaces/CMSView)[]

Defined in: [types/src/controllers/navigation.ts:87](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Custom additional views created by the developer, added to the admin
navigation

***

### loading

> **loading**: `boolean`

Defined in: [types/src/controllers/navigation.ts:100](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Is the navigation loading (the configuration persistence has not
loaded yet, or a specified navigation builder has not completed)

***

### navigationLoadingError?

> `optional` **navigationLoadingError**: `unknown`

Defined in: [types/src/controllers/navigation.ts:105](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Was there an error while loading the navigation data

***

### plugins?

> `optional` **plugins**: [`RebasePlugin`](RebasePlugin)\<`any`, `any`, `any`\>[]

Defined in: [types/src/controllers/navigation.ts:115](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Plugin system allowing to extend the CMS functionality.

***

### refreshNavigation()

> **refreshNavigation**: () => `void`

Defined in: [types/src/controllers/navigation.ts:110](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Call this method to recalculate the navigation

#### Returns

`void`

***

### topLevelNavigation?

> `optional` **topLevelNavigation**: [`NavigationResult`](NavigationResult)

Defined in: [types/src/controllers/navigation.ts:94](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Configuration for the views that should be displayed at the top
level of the navigation (e.g. in the home page or the navigation
drawer)

***

### views?

> `optional` **views**: [`CMSView`](../interfaces/CMSView)[]

Defined in: [types/src/controllers/navigation.ts:81](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Custom additional views created by the developer, added to the main
navigation
