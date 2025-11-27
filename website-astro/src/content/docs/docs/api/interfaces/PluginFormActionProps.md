---
slug: "docs/api/interfaces/PluginFormActionProps"
title: "PluginFormActionProps"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / PluginFormActionProps

# Interface: PluginFormActionProps\<USER, EC\>

Defined in: [types/plugins.tsx:232](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

### EC

`EC` *extends* [`EntityCollection`](EntityCollection) = [`EntityCollection`](EntityCollection)

## Properties

### collection

> **collection**: `EC`

Defined in: [types/plugins.tsx:237](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### context

> **context**: [`FireCMSContext`](../type-aliases/FireCMSContext)\<`USER`\>

Defined in: [types/plugins.tsx:240](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### disabled

> **disabled**: `boolean`

Defined in: [types/plugins.tsx:238](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### entityId?

> `optional` **entityId**: `string`

Defined in: [types/plugins.tsx:233](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### formContext?

> `optional` **formContext**: [`FormContext`](FormContext)\<`any`\>

Defined in: [types/plugins.tsx:239](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### openEntityMode

> **openEntityMode**: `"side_panel"` \| `"full_screen"`

Defined in: [types/plugins.tsx:241](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### parentCollectionIds

> **parentCollectionIds**: `string`[]

Defined in: [types/plugins.tsx:235](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### path

> **path**: `string`

Defined in: [types/plugins.tsx:234](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### status

> **status**: [`EntityStatus`](../type-aliases/EntityStatus)

Defined in: [types/plugins.tsx:236](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)
