---
slug: "docs/api/type-aliases/InferPropertyType"
title: "InferPropertyType"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / InferPropertyType

# Type Alias: InferPropertyType\<P\>

> **InferPropertyType**\<`P`\> = `P` *extends* [`StringProperty`](../interfaces/StringProperty) ? `string` : `P` *extends* [`NumberProperty`](../interfaces/NumberProperty) ? `number` : `P` *extends* [`BooleanProperty`](../interfaces/BooleanProperty) ? `boolean` : `P` *extends* [`DateProperty`](../interfaces/DateProperty) ? `Date` : `P` *extends* [`GeopointProperty`](../interfaces/GeopointProperty) ? [`GeoPoint`](../classes/GeoPoint) : `P` *extends* [`ReferenceProperty`](../interfaces/ReferenceProperty) ? [`EntityReference`](../classes/EntityReference) : `P` *extends* [`RelationProperty`](../interfaces/RelationProperty) ? [`EntityRelation`](../classes/EntityRelation) \| [`EntityRelation`](../classes/EntityRelation)[] : `P` *extends* [`ArrayProperty`](../interfaces/ArrayProperty) ? ...\[...\] *extends* [`Property`](Property) ? ...[] : ...[] : `P` *extends* [`MapProperty`](../interfaces/MapProperty) ? ... *extends* ... ? ... : ... : `never`

Defined in: [types/src/types/properties.ts:71](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

A helper type to infer the underlying data type from a Property definition.
This is the core of the type inference system.

## Type Parameters

### P

`P` *extends* [`Property`](Property)
