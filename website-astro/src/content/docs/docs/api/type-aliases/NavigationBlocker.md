---
slug: "docs/api/type-aliases/NavigationBlocker"
title: "NavigationBlocker"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / NavigationBlocker

# Type Alias: NavigationBlocker

> **NavigationBlocker** = `object`

Defined in: [types/src/controllers/navigation.ts:193](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

## Properties

### isBlocked()

> **isBlocked**: (`path`) => `boolean`

Defined in: [types/src/controllers/navigation.ts:195](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

#### Parameters

##### path

`string`

#### Returns

`boolean`

***

### proceed()?

> `optional` **proceed**: () => `void`

Defined in: [types/src/controllers/navigation.ts:196](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

#### Returns

`void`

***

### reset()?

> `optional` **reset**: () => `void`

Defined in: [types/src/controllers/navigation.ts:197](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

#### Returns

`void`

***

### updateBlockListener()

> **updateBlockListener**: (`path`, `block`, `basePath?`) => () => `void`

Defined in: [types/src/controllers/navigation.ts:194](https://github.com/rebaseco/rebase/blob/main/packages/types/src/controllers/navigation.ts)

#### Parameters

##### path

`string`

##### block

`boolean`

##### basePath?

`string`

#### Returns

> (): `void`

##### Returns

`void`
