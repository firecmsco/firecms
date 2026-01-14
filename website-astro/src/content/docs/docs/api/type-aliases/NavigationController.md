---
slug: "docs/api/type-aliases/NavigationController"
title: "NavigationController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / NavigationController

# Type Alias: NavigationController\<EC\>

> **NavigationController**\<`EC`\> = `object`

Defined in: [types/navigation.ts:12](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Controller that includes the resolved navigation and utility methods and
attributes.
This controller holds the state of the navigation including the collections.

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection) = [`EntityCollection`](../interfaces/EntityCollection)\<`any`\>

## Properties

### adminViews?

> `optional` **adminViews**: [`CMSView`](../interfaces/CMSView)[]

Defined in: [types/navigation.ts:32](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Custom additional views created by the developer, added to the admin
navigation

***

### baseCollectionPath

> **baseCollectionPath**: `string`

Defined in: [types/navigation.ts:88](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Default path under the collection routes of the CMS will be created.
It defaults to '/c'

***

### basePath

> **basePath**: `string`

Defined in: [types/navigation.ts:82](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Default path under the navigation routes of the CMS will be created.
Defaults to '/'. You may want to change this `basepath` to 'admin' for example.

***

### buildUrlCollectionPath()

> **buildUrlCollectionPath**: (`path`) => `string`

Defined in: [types/navigation.ts:116](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Build a URL collection path from a data path
`products` => `/c/products`
`products/B34SAP8Z` => `/c/products/B34SAP8Z`

#### Parameters

##### path

`string`

#### Returns

`string`

***

### collections?

> `optional` **collections**: [`EntityCollection`](../interfaces/EntityCollection)[]

Defined in: [types/navigation.ts:20](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

List of the mapped collections in the CMS.
Each entry relates to a collection in the root database.
Each of the navigation entries in this field
generates an entry in the main menu.

***

### convertIdsToPaths()

> **convertIdsToPaths**: (`ids`) => `string`[]

Defined in: [types/navigation.ts:146](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Resolve paths from a list of ids

#### Parameters

##### ids

`string`[]

#### Returns

`string`[]

***

### getCollection()

> **getCollection**: (`pathOrId`, `includeUserOverride?`) => `EC` \| `undefined`

Defined in: [types/navigation.ts:61](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Get the collection configuration for a given path.
The collection is resolved from the given path or alias.

#### Parameters

##### pathOrId

`string`

##### includeUserOverride?

`boolean`

#### Returns

`EC` \| `undefined`

***

### getCollectionById()

> **getCollectionById**: (`id`) => `EC` \| `undefined`

Defined in: [types/navigation.ts:66](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Get the top level collection configuration for a given id

#### Parameters

##### id

`string`

#### Returns

`EC` \| `undefined`

***

### getCollectionFromIds()

> **getCollectionFromIds**: (`ids`) => `EC` \| `undefined`

Defined in: [types/navigation.ts:71](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Get the collection configuration from its parent ids.

#### Parameters

##### ids

`string`[]

#### Returns

`EC` \| `undefined`

***

### getCollectionFromPaths()

> **getCollectionFromPaths**: (`pathSegments`) => `EC` \| `undefined`

Defined in: [types/navigation.ts:76](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Get the collection configuration from its parent path segments.

#### Parameters

##### pathSegments

`string`[]

#### Returns

`EC` \| `undefined`

***

### getParentCollectionIds()

> **getParentCollectionIds**: (`path`) => `string`[]

Defined in: [types/navigation.ts:140](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Retrieve all the related parent collection ids for a given path

#### Parameters

##### path

`string`

#### Returns

`string`[]

***

### getParentReferencesFromPath()

> **getParentReferencesFromPath**: (`path`) => [`EntityReference`](../classes/EntityReference)[]

Defined in: [types/navigation.ts:134](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Retrieve all the related parent references for a given path

#### Parameters

##### path

`string`

#### Returns

[`EntityReference`](../classes/EntityReference)[]

***

### homeUrl

> **homeUrl**: `string`

Defined in: [types/navigation.ts:102](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Base url path for the home screen

***

### initialised

> **initialised**: `boolean`

Defined in: [types/navigation.ts:55](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Is the registry ready to be used

***

### isUrlCollectionPath()

> **isUrlCollectionPath**: (`urlPath`) => `boolean`

Defined in: [types/navigation.ts:108](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Check if a url path belongs to a collection

#### Parameters

##### urlPath

`string`

#### Returns

`boolean`

***

### loading

> **loading**: `boolean`

Defined in: [types/navigation.ts:45](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Is the navigation loading (the configuration persistence has not
loaded yet, or a specified navigation builder has not completed)

***

### navigate()

> **navigate**: (`to`, `options?`) => `void`

Defined in: [types/navigation.ts:154](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

A function to navigate to a specified route or URL.

#### Parameters

##### to

`string`

The target route or URL to navigate to.

##### options?

[`NavigateOptions`](../interfaces/NavigateOptions)

Optional configuration settings for navigation, such as replace behavior or state data.

#### Returns

`void`

***

### navigationLoadingError?

> `optional` **navigationLoadingError**: `any`

Defined in: [types/navigation.ts:50](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Was there an error while loading the navigation data

***

### plugins?

> `optional` **plugins**: [`FireCMSPlugin`](FireCMSPlugin)\<`any`, `any`, `any`\>[]

Defined in: [types/navigation.ts:159](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Plugin system allowing to extend the CMS functionality.

***

### refreshNavigation()

> **refreshNavigation**: () => `void`

Defined in: [types/navigation.ts:128](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Call this method to recalculate the navigation

#### Returns

`void`

***

### resolveIdsFrom()

> **resolveIdsFrom**: (`pathWithAliases`) => `string`

Defined in: [types/navigation.ts:123](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Turn a path with collection ids into a resolved path.
The ids (typically used in urls) will be replaced with relative paths (typically used in database paths)

#### Parameters

##### pathWithAliases

`string`

#### Returns

`string`

***

### topLevelNavigation?

> `optional` **topLevelNavigation**: [`NavigationResult`](NavigationResult)

Defined in: [types/navigation.ts:39](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Configuration for the views that should be displayed at the top
level of the navigation (e.g. in the home page or the navigation
drawer)

***

### urlPathToDataPath()

> **urlPathToDataPath**: (`cmsPath`) => `string`

Defined in: [types/navigation.ts:97](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Convert a URL path to a collection or entity path
`/c/products` => `products`
`/my_cms/c/products/B34SAP8Z` => `products/B34SAP8Z`
`/my_cms/my_view` => `my_view`

#### Parameters

##### cmsPath

`string`

#### Returns

`string`

***

### views?

> `optional` **views**: [`CMSView`](../interfaces/CMSView)[]

Defined in: [types/navigation.ts:26](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/navigation.ts)

Custom additional views created by the developer, added to the main
navigation
