---
slug: "docs/api/interfaces/PluginHomePageActionsProps"
title: "PluginHomePageActionsProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / PluginHomePageActionsProps

# Interface: PluginHomePageActionsProps\<EP, M, USER, EC\>

Defined in: [types/src/types/plugins.tsx:278](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

Props passed to the [RebasePlugin.homePage.CollectionActions](../type-aliases/RebasePlugin.md#homepage) method.
You can use it to add custom actions to the navigation card of each collection.

## Type Parameters

### EP

`EP` *extends* `object` = `object`

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

### EC

`EC` *extends* [`EntityCollection`](EntityCollection)\<`M`\> = [`EntityCollection`](EntityCollection)\<`M`\>

## Properties

### collection

> **collection**: `EC`

Defined in: [types/src/types/plugins.tsx:288](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

The collection configuration

***

### context

> **context**: [`RebaseContext`](../type-aliases/RebaseContext)\<`USER`\>

Defined in: [types/src/types/plugins.tsx:293](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

Context of the app status

***

### extraProps?

> `optional` **extraProps**: `EP`

Defined in: [types/src/types/plugins.tsx:295](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### slug

> **slug**: `string`

Defined in: [types/src/types/plugins.tsx:283](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

Collection path of this entity. This is the full path, like
`users/1234/addresses`
