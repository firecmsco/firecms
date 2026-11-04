---
slug: "docs/api/type-aliases/PluginFieldBuilderParams"
title: "PluginFieldBuilderParams"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / PluginFieldBuilderParams

# Type Alias: PluginFieldBuilderParams\<T, M, EC\>

> **PluginFieldBuilderParams**\<`T`, `M`, `EC`\> = `object`

Defined in: [types/plugins.tsx:244](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

## Type Parameters

### T

`T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = [`CMSType`](/docs/api/type-aliases/CMSType)

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

### EC

`EC` *extends* [`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`M`\> = [`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`M`\>

## Properties

### collection?

> `optional` **collection**: `EC`

Defined in: [types/plugins.tsx:251](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### Field

> **Field**: `React.ComponentType`\<[`FieldProps`](/docs/api/interfaces/FieldProps)\<`T`, `any`, `M`\>\>

Defined in: [types/plugins.tsx:248](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### fieldConfigId

> **fieldConfigId**: `string`

Defined in: [types/plugins.tsx:245](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### path?

> `optional` **path**: `string`

Defined in: [types/plugins.tsx:250](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### plugin

> **plugin**: [`FireCMSPlugin`](/docs/api/type-aliases/FireCMSPlugin)

Defined in: [types/plugins.tsx:249](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### property

> **property**: [`Property`](/docs/api/type-aliases/Property)\<`T`\> \| [`ResolvedProperty`](/docs/api/type-aliases/ResolvedProperty)\<`T`\>

Defined in: [types/plugins.tsx:247](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)

***

### propertyKey

> **propertyKey**: `string`

Defined in: [types/plugins.tsx:246](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/plugins.tsx)
