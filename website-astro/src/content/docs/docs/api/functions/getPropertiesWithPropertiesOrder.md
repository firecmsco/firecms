---
slug: "docs/api/functions/getPropertiesWithPropertiesOrder"
title: "getPropertiesWithPropertiesOrder"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / getPropertiesWithPropertiesOrder

# Function: getPropertiesWithPropertiesOrder()

> **getPropertiesWithPropertiesOrder**\<`M`\>(`properties`, `propertiesOrder?`): [`PropertiesOrBuilders`](/docs/api/type-aliases/PropertiesOrBuilders)\<`M`\>

Defined in: [util/property\_utils.tsx:120](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/property_utils.tsx)

Get properties exclusively indexed by their order

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### properties

[`PropertiesOrBuilders`](/docs/api/type-aliases/PropertiesOrBuilders)\<`M`\>

### propertiesOrder?

`Extract`\<keyof `M`, `string`\>[]

## Returns

[`PropertiesOrBuilders`](/docs/api/type-aliases/PropertiesOrBuilders)\<`M`\>
