---
slug: "docs/api/type-aliases/InferEntityType"
title: "InferEntityType"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / InferEntityType

# Type Alias: InferEntityType\<P\>

> **InferEntityType**\<`P`\> = `{ -readonly [K in keyof P as P[K] extends { validation?: { required: true } } ? K : never]: InferPropertyType<P[K]> }` & `{ -readonly [K in keyof P as P[K] extends { validation?: { required: true } } ? never : K]?: InferPropertyType<P[K]> }`

Defined in: [types/src/types/properties.ts:95](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

A generic type that converts a `Properties` schema definition into a corresponding
TypeScript entity type. It correctly handles required and optional properties.

## Type Parameters

### P

`P` *extends* [`Properties`](Properties)

## Example

```ts
const productSchema = {
name: { type: 'string', validation: { required: true } },
price: { type: 'number' }
};
type Product = InferEntityType<typeof productSchema>;
// Result: { name: string; price?: number; }
```
