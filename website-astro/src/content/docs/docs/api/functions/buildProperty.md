---
slug: "docs/api/functions/buildProperty"
title: "buildProperty"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / buildProperty

# Function: buildProperty()

> **buildProperty**\<`T`, `P`\>(`property`): `P` *extends* [`StringProperty`](../interfaces/StringProperty) ? [`StringProperty`](../interfaces/StringProperty) : `P` *extends* [`NumberProperty`](../interfaces/NumberProperty) ? [`NumberProperty`](../interfaces/NumberProperty) : `P` *extends* [`BooleanProperty`](../interfaces/BooleanProperty) ? [`BooleanProperty`](../interfaces/BooleanProperty) : `P` *extends* [`DateProperty`](../interfaces/DateProperty) ? [`DateProperty`](../interfaces/DateProperty) : `P` *extends* [`GeopointProperty`](../interfaces/GeopointProperty) ? [`GeopointProperty`](../interfaces/GeopointProperty) : `P` *extends* [`ReferenceProperty`](../interfaces/ReferenceProperty) ? [`ReferenceProperty`](../interfaces/ReferenceProperty) : `P` *extends* [`ArrayProperty`](../interfaces/ArrayProperty) ? [`ArrayProperty`](../interfaces/ArrayProperty) : `P` *extends* [`MapProperty`](../interfaces/MapProperty) ? [`MapProperty`](../interfaces/MapProperty) : `never`

Defined in: [common/src/util/builders.ts:41](https://github.com/rebaseco/rebase/blob/main/packages/common/src/util/builders.ts)

Identity function we use to defeat the type system of Typescript and preserve
the property keys.

## Type Parameters

### T

`T`

### P

`P` *extends* [`Property`](../type-aliases/Property) = [`Property`](../type-aliases/Property)

## Parameters

### property

`P`

## Returns

`P` *extends* [`StringProperty`](../interfaces/StringProperty) ? [`StringProperty`](../interfaces/StringProperty) : `P` *extends* [`NumberProperty`](../interfaces/NumberProperty) ? [`NumberProperty`](../interfaces/NumberProperty) : `P` *extends* [`BooleanProperty`](../interfaces/BooleanProperty) ? [`BooleanProperty`](../interfaces/BooleanProperty) : `P` *extends* [`DateProperty`](../interfaces/DateProperty) ? [`DateProperty`](../interfaces/DateProperty) : `P` *extends* [`GeopointProperty`](../interfaces/GeopointProperty) ? [`GeopointProperty`](../interfaces/GeopointProperty) : `P` *extends* [`ReferenceProperty`](../interfaces/ReferenceProperty) ? [`ReferenceProperty`](../interfaces/ReferenceProperty) : `P` *extends* [`ArrayProperty`](../interfaces/ArrayProperty) ? [`ArrayProperty`](../interfaces/ArrayProperty) : `P` *extends* [`MapProperty`](../interfaces/MapProperty) ? [`MapProperty`](../interfaces/MapProperty) : `never`
