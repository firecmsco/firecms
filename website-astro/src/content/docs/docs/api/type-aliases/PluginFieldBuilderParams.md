---
slug: "docs/api/type-aliases/PluginFieldBuilderParams"
title: "PluginFieldBuilderParams"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / PluginFieldBuilderParams

# Type Alias: PluginFieldBuilderParams\<M, EC\>

> **PluginFieldBuilderParams**\<`M`, `EC`\> = `object`

Defined in: [types/src/types/plugins.tsx:311](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection)\<`M`\> = [`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

## Properties

### collection?

> `optional` **collection**: `EC`

Defined in: [types/src/types/plugins.tsx:318](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### Field

> **Field**: `React.ComponentType`\<[`FieldProps`](../interfaces/FieldProps)\<[`Property`](Property), `unknown`, `M`\>\>

Defined in: [types/src/types/plugins.tsx:315](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### fieldConfigId

> **fieldConfigId**: `string`

Defined in: [types/src/types/plugins.tsx:312](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### path?

> `optional` **path**: `string`

Defined in: [types/src/types/plugins.tsx:317](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### plugin

> **plugin**: [`RebasePlugin`](RebasePlugin)

Defined in: [types/src/types/plugins.tsx:316](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### property

> **property**: [`Property`](Property)

Defined in: [types/src/types/plugins.tsx:314](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)

***

### propertyKey

> **propertyKey**: `string`

Defined in: [types/src/types/plugins.tsx:313](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/plugins.tsx)
