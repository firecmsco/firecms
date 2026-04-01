---
slug: "docs/api/type-aliases/CMSUrlController"
title: "CMSUrlController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / CMSUrlController

# Type Alias: CMSUrlController

> **CMSUrlController** = `object`

Defined in: [types/src/controllers/navigation.ts:8](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Controller that handles URL path building and resolution.

## Properties

### baseCollectionPath

> **baseCollectionPath**: `string`

Defined in: [types/src/controllers/navigation.ts:19](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Default path under the collection routes of the CMS will be created.
It defaults to '/c'

***

### basePath

> **basePath**: `string`

Defined in: [types/src/controllers/navigation.ts:13](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Default path under the navigation routes of the CMS will be created.
Defaults to '/'. You may want to change this `basepath` to 'admin' for example.

***

### buildCMSUrlPath()

> **buildCMSUrlPath**: (`path`) => `string`

Defined in: [types/src/controllers/navigation.ts:53](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Build a URL path for the CMS (e.g. for custom views)

#### Parameters

##### path

`string`

#### Returns

`string`

***

### buildUrlCollectionPath()

> **buildUrlCollectionPath**: (`path`) => `string`

Defined in: [types/src/controllers/navigation.ts:47](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Build a URL collection path from a data path
`products` => `/c/products`
`products/B34SAP8Z` => `/c/products/B34SAP8Z`

#### Parameters

##### path

`string`

#### Returns

`string`

***

### homeUrl

> **homeUrl**: `string`

Defined in: [types/src/controllers/navigation.ts:33](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Base url path for the home screen

***

### isUrlCollectionPath()

> **isUrlCollectionPath**: (`urlPath`) => `boolean`

Defined in: [types/src/controllers/navigation.ts:39](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Check if a url path belongs to a collection

#### Parameters

##### urlPath

`string`

#### Returns

`boolean`

***

### navigate()

> **navigate**: (`to`, `options?`) => `void`

Defined in: [types/src/controllers/navigation.ts:68](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

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

### resolveDatabasePathsFrom()

> **resolveDatabasePathsFrom**: (`path`) => `string`

Defined in: [types/src/controllers/navigation.ts:60](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Turn a path with collection ids into a resolved path.
The ids (typically used in urls) will be replaced with relative paths (typically used in database paths)

#### Parameters

##### path

`string`

#### Returns

`string`

***

### urlPathToDataPath()

> **urlPathToDataPath**: (`cmsPath`) => `string`

Defined in: [types/src/controllers/navigation.ts:28](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

Convert a URL path to a collection or entity path
`/c/products` => `products`
`/my_cms/c/products/B34SAP8Z` => `products/B34SAP8Z`
`/my_cms/my_view` => `my_view`

#### Parameters

##### cmsPath

`string`

#### Returns

`string`
