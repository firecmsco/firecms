---
slug: "docs/api/type-aliases/PropertyBuilder"
title: "PropertyBuilder"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / PropertyBuilder

# Type Alias: PropertyBuilder()\<T, M\>

> **PropertyBuilder**\<`T`, `M`\> = (`{
         values,
         previousValues,
         propertyValue,
         index,
         path,
         entityId,
         authController
     }`) => [`Property`](Property)\<`T`\> \| `null`

Defined in: [types/properties.ts:287](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

You can use this type to define a property dynamically, based
on the current values of the entity, the previous values and the
current value of the property, as well as the path and entity ID.

## Type Parameters

### T

`T` *extends* [`CMSType`](CMSType) = `any`

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Parameters

### \{
         values,
         previousValues,
         propertyValue,
         index,
         path,
         entityId,
         authController
     \}

[`PropertyBuilderProps`](PropertyBuilderProps)\<`M`\>

## Returns

[`Property`](Property)\<`T`\> \| `null`
