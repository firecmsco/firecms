---
slug: "docs/api/type-aliases/NavigationBlocker"
title: "NavigationBlocker"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / NavigationBlocker

# Type Alias: NavigationBlocker

> **NavigationBlocker** = `object`

Defined in: [types/src/controllers/navigation.ts:184](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

## Properties

### isBlocked()

> **isBlocked**: (`path`) => `boolean`

Defined in: [types/src/controllers/navigation.ts:186](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

#### Parameters

##### path

`string`

#### Returns

`boolean`

***

### proceed()?

> `optional` **proceed**: () => `void`

Defined in: [types/src/controllers/navigation.ts:187](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

#### Returns

`void`

***

### reset()?

> `optional` **reset**: () => `void`

Defined in: [types/src/controllers/navigation.ts:188](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

#### Returns

`void`

***

### updateBlockListener()

> **updateBlockListener**: (`path`, `block`, `basePath?`) => () => `void`

Defined in: [types/src/controllers/navigation.ts:185](https://github.com/rebasepro/rebase/blob/main/packages/types/src/controllers/navigation.ts)

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
