---
slug: "docs/api/functions/getPropertiesWithPropertiesOrder"
title: "getPropertiesWithPropertiesOrder"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / getPropertiesWithPropertiesOrder

# Function: getPropertiesWithPropertiesOrder()

> **getPropertiesWithPropertiesOrder**\<`M`\>(`properties`, `propertiesOrder?`): [`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`M`\>

Defined in: [util/property\_utils.tsx:120](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/property_utils.tsx)

Get properties exclusively indexed by their order

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### properties

[`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`M`\>

### propertiesOrder?

`Extract`\<keyof `M`, `string`\>[]

## Returns

[`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`M`\>
