---
slug: "docs/api/interfaces/PluginFormActionProps"
title: "PluginFormActionProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / PluginFormActionProps

# Interface: PluginFormActionProps\<USER, EC\>

Defined in: [types/src/types/plugins.tsx:299](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

### EC

`EC` *extends* [`EntityCollection`](EntityCollection) = [`EntityCollection`](EntityCollection)

## Properties

### collection

> **collection**: `EC`

Defined in: [types/src/types/plugins.tsx:304](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### context

> **context**: [`RebaseContext`](../type-aliases/RebaseContext)\<`USER`\>

Defined in: [types/src/types/plugins.tsx:307](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### disabled

> **disabled**: `boolean`

Defined in: [types/src/types/plugins.tsx:305](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### entityId?

> `optional` **entityId**: `string` \| `number`

Defined in: [types/src/types/plugins.tsx:300](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### formContext?

> `optional` **formContext**: [`FormContext`](FormContext)\<`any`\>

Defined in: [types/src/types/plugins.tsx:306](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### openEntityMode

> **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [types/src/types/plugins.tsx:308](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### parentCollectionIds

> **parentCollectionIds**: `string`[]

Defined in: [types/src/types/plugins.tsx:302](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### path

> **path**: `string`

Defined in: [types/src/types/plugins.tsx:301](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### status

> **status**: [`EntityStatus`](../type-aliases/EntityStatus)

Defined in: [types/src/types/plugins.tsx:303](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/plugins.tsx)
