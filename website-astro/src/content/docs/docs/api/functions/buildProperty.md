---
slug: "docs/api/functions/buildProperty"
title: "buildProperty"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / buildProperty

# Function: buildProperty()

> **buildProperty**\<`T`, `P`, `M`\>(`property`): `P` *extends* [`StringProperty`](../interfaces/StringProperty) ? [`StringProperty`](../interfaces/StringProperty) : `P` *extends* [`NumberProperty`](../interfaces/NumberProperty) ? [`NumberProperty`](../interfaces/NumberProperty) : `P` *extends* [`BooleanProperty`](../interfaces/BooleanProperty) ? [`BooleanProperty`](../interfaces/BooleanProperty) : `P` *extends* [`DateProperty`](../interfaces/DateProperty) ? [`DateProperty`](../interfaces/DateProperty) : `P` *extends* [`GeopointProperty`](../interfaces/GeopointProperty) ? [`GeopointProperty`](../interfaces/GeopointProperty) : `P` *extends* [`ReferenceProperty`](../interfaces/ReferenceProperty) ? [`ReferenceProperty`](../interfaces/ReferenceProperty) : `P` *extends* [`ArrayProperty`](../interfaces/ArrayProperty)\<`any`[], `any`\> ? [`ArrayProperty`](../interfaces/ArrayProperty)\<`any`[], `any`\> : `P` *extends* [`MapProperty`](../interfaces/MapProperty)\<`Record`\<`string`, [`CMSType`](../type-aliases/CMSType)\>\> ? [`MapProperty`](../interfaces/MapProperty)\<`Record`\<`string`, [`CMSType`](../type-aliases/CMSType)\>\> : `P` *extends* [`PropertyBuilder`](../type-aliases/PropertyBuilder)\<`T`, `M`\> ? [`PropertyBuilder`](../type-aliases/PropertyBuilder)\<`T`, `M`\> : `never`

Defined in: [util/builders.ts:44](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/builders.ts)

Identity function we use to defeat the type system of Typescript and preserve
the property keys.

## Type Parameters

### T

`T` *extends* [`CMSType`](../type-aliases/CMSType) = [`CMSType`](../type-aliases/CMSType)

### P

`P` *extends* [`StringProperty`](../interfaces/StringProperty) \| [`NumberProperty`](../interfaces/NumberProperty) \| [`BooleanProperty`](../interfaces/BooleanProperty) \| [`DateProperty`](../interfaces/DateProperty) \| [`GeopointProperty`](../interfaces/GeopointProperty) \| [`ReferenceProperty`](../interfaces/ReferenceProperty) \| [`ArrayProperty`](../interfaces/ArrayProperty)\<[`CMSType`](../type-aliases/CMSType)[] & `Record`\<`string`, `any`\>, `any`\> \| [`MapProperty`](../interfaces/MapProperty)\<`Record`\<`string`, `any`\>\> \| [`ArrayProperty`](../interfaces/ArrayProperty)\<[`CMSType`](../type-aliases/CMSType)[], `any`\> \| [`PropertyBuilder`](../type-aliases/PropertyBuilder)\<`T`, `any`\> = [`PropertyOrBuilder`](../type-aliases/PropertyOrBuilder)\<`T`\>

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Parameters

### property

`P`

## Returns

`P` *extends* [`StringProperty`](../interfaces/StringProperty) ? [`StringProperty`](../interfaces/StringProperty) : `P` *extends* [`NumberProperty`](../interfaces/NumberProperty) ? [`NumberProperty`](../interfaces/NumberProperty) : `P` *extends* [`BooleanProperty`](../interfaces/BooleanProperty) ? [`BooleanProperty`](../interfaces/BooleanProperty) : `P` *extends* [`DateProperty`](../interfaces/DateProperty) ? [`DateProperty`](../interfaces/DateProperty) : `P` *extends* [`GeopointProperty`](../interfaces/GeopointProperty) ? [`GeopointProperty`](../interfaces/GeopointProperty) : `P` *extends* [`ReferenceProperty`](../interfaces/ReferenceProperty) ? [`ReferenceProperty`](../interfaces/ReferenceProperty) : `P` *extends* [`ArrayProperty`](../interfaces/ArrayProperty)\<`any`[], `any`\> ? [`ArrayProperty`](../interfaces/ArrayProperty)\<`any`[], `any`\> : `P` *extends* [`MapProperty`](../interfaces/MapProperty)\<`Record`\<`string`, [`CMSType`](../type-aliases/CMSType)\>\> ? [`MapProperty`](../interfaces/MapProperty)\<`Record`\<`string`, [`CMSType`](../type-aliases/CMSType)\>\> : `P` *extends* [`PropertyBuilder`](../type-aliases/PropertyBuilder)\<`T`, `M`\> ? [`PropertyBuilder`](../type-aliases/PropertyBuilder)\<`T`, `M`\> : `never`
