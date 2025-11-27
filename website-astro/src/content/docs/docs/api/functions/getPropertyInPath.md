---
slug: "docs/api/functions/getPropertyInPath"
title: "getPropertyInPath"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / getPropertyInPath

# Function: getPropertyInPath()

> **getPropertyInPath**\<`M`\>(`properties`, `path`): [`PropertyOrBuilder`](../type-aliases/PropertyOrBuilder)\<`any`, `M`\> \| `undefined`

Defined in: [util/property\_utils.tsx:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/property_utils.tsx)

Get a property in a property tree from a path like
`address.street`

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### properties

[`ResolvedProperties`](../type-aliases/ResolvedProperties)\<`any`\> | [`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`M`\>

### path

`string`

## Returns

[`PropertyOrBuilder`](../type-aliases/PropertyOrBuilder)\<`any`, `M`\> \| `undefined`
