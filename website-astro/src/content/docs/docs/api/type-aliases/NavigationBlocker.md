---
slug: "docs/api/type-aliases/NavigationBlocker"
title: "NavigationBlocker"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / NavigationBlocker

# Type Alias: NavigationBlocker

> **NavigationBlocker** = `object`

Defined in: [types/navigation.ts:173](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/navigation.ts)

## Properties

### isBlocked()

> **isBlocked**: (`path`) => `boolean`

Defined in: [types/navigation.ts:175](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/navigation.ts)

#### Parameters

##### path

`string`

#### Returns

`boolean`

***

### proceed()?

> `optional` **proceed**: () => `void`

Defined in: [types/navigation.ts:176](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/navigation.ts)

#### Returns

`void`

***

### reset()?

> `optional` **reset**: () => `void`

Defined in: [types/navigation.ts:177](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/navigation.ts)

#### Returns

`void`

***

### updateBlockListener()

> **updateBlockListener**: (`path`, `block`, `basePath?`) => () => `void`

Defined in: [types/navigation.ts:174](https://github.com/rebaseco/rebase/blob/main/packages/core/src/types/navigation.ts)

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
