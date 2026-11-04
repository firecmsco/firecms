---
slug: "docs/api/interfaces/PluginHomePageActionsProps"
title: "PluginHomePageActionsProps"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / PluginHomePageActionsProps

# Interface: PluginHomePageActionsProps\<EP, M, USER, EC\>

Defined in: [types/plugins.tsx:211](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

Props passed to the [FireCMSPlugin.homePage.CollectionActions](/docs/api/type-aliases/FireCMSPlugin#homepage) method.
You can use it to add custom actions to the navigation card of each collection.

## Type Parameters

### EP

`EP` *extends* `object` = `object`

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User) = [`User`](/docs/api/type-aliases/User)

### EC

`EC` *extends* [`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`M`\> = [`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`M`\>

## Properties

### collection

> **collection**: `EC`

Defined in: [types/plugins.tsx:221](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

The collection configuration

***

### context

> **context**: [`FireCMSContext`](/docs/api/type-aliases/FireCMSContext)\<`USER`\>

Defined in: [types/plugins.tsx:226](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

Context of the app status

***

### extraProps?

> `optional` **extraProps**: `EP`

Defined in: [types/plugins.tsx:228](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### path

> **path**: `string`

Defined in: [types/plugins.tsx:216](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

Collection path of this entity. This is the full path, like
`users/1234/addresses`
