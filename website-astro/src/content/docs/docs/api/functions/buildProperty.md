---
slug: "docs/api/functions/buildProperty"
title: "buildProperty"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / buildProperty

# Function: buildProperty()

> **buildProperty**\<`T`, `P`, `M`\>(`property`): `P` *extends* [`StringProperty`](/docs/api/interfaces/StringProperty) ? [`StringProperty`](/docs/api/interfaces/StringProperty) : `P` *extends* [`NumberProperty`](/docs/api/interfaces/NumberProperty) ? [`NumberProperty`](/docs/api/interfaces/NumberProperty) : `P` *extends* [`BooleanProperty`](/docs/api/interfaces/BooleanProperty) ? [`BooleanProperty`](/docs/api/interfaces/BooleanProperty) : `P` *extends* [`DateProperty`](/docs/api/interfaces/DateProperty) ? [`DateProperty`](/docs/api/interfaces/DateProperty) : `P` *extends* [`GeopointProperty`](/docs/api/interfaces/GeopointProperty) ? [`GeopointProperty`](/docs/api/interfaces/GeopointProperty) : `P` *extends* [`ReferenceProperty`](/docs/api/interfaces/ReferenceProperty) ? [`ReferenceProperty`](/docs/api/interfaces/ReferenceProperty) : `P` *extends* [`ArrayProperty`](/docs/api/interfaces/ArrayProperty)\<`any`[], `any`\> ? [`ArrayProperty`](/docs/api/interfaces/ArrayProperty)\<`any`[], `any`\> : `P` *extends* [`MapProperty`](/docs/api/interfaces/MapProperty)\<`Record`\<`string`, [`CMSType`](/docs/api/type-aliases/CMSType)\>\> ? [`MapProperty`](/docs/api/interfaces/MapProperty)\<`Record`\<`string`, [`CMSType`](/docs/api/type-aliases/CMSType)\>\> : `P` *extends* [`PropertyBuilder`](/docs/api/type-aliases/PropertyBuilder)\<`T`, `M`\> ? [`PropertyBuilder`](/docs/api/type-aliases/PropertyBuilder)\<`T`, `M`\> : `never`

Defined in: [util/builders.ts:44](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/builders.ts)

Identity function we use to defeat the type system of Typescript and preserve
the property keys.

## Type Parameters

### T

`T` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = [`CMSType`](/docs/api/type-aliases/CMSType)

### P

`P` *extends* [`StringProperty`](/docs/api/interfaces/StringProperty) \| [`NumberProperty`](/docs/api/interfaces/NumberProperty) \| [`BooleanProperty`](/docs/api/interfaces/BooleanProperty) \| [`DateProperty`](/docs/api/interfaces/DateProperty) \| [`GeopointProperty`](/docs/api/interfaces/GeopointProperty) \| [`ReferenceProperty`](/docs/api/interfaces/ReferenceProperty) \| [`ArrayProperty`](/docs/api/interfaces/ArrayProperty)\<[`CMSType`](/docs/api/type-aliases/CMSType)[] & `Record`\<`string`, `any`\>, `any`\> \| [`MapProperty`](/docs/api/interfaces/MapProperty)\<`Record`\<`string`, `any`\>\> \| [`ArrayProperty`](/docs/api/interfaces/ArrayProperty)\<[`CMSType`](/docs/api/type-aliases/CMSType)[], `any`\> \| [`PropertyBuilder`](/docs/api/type-aliases/PropertyBuilder)\<`T`, `any`\> = [`PropertyOrBuilder`](/docs/api/type-aliases/PropertyOrBuilder)\<`T`\>

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Parameters

### property

`P`

## Returns

`P` *extends* [`StringProperty`](/docs/api/interfaces/StringProperty) ? [`StringProperty`](/docs/api/interfaces/StringProperty) : `P` *extends* [`NumberProperty`](/docs/api/interfaces/NumberProperty) ? [`NumberProperty`](/docs/api/interfaces/NumberProperty) : `P` *extends* [`BooleanProperty`](/docs/api/interfaces/BooleanProperty) ? [`BooleanProperty`](/docs/api/interfaces/BooleanProperty) : `P` *extends* [`DateProperty`](/docs/api/interfaces/DateProperty) ? [`DateProperty`](/docs/api/interfaces/DateProperty) : `P` *extends* [`GeopointProperty`](/docs/api/interfaces/GeopointProperty) ? [`GeopointProperty`](/docs/api/interfaces/GeopointProperty) : `P` *extends* [`ReferenceProperty`](/docs/api/interfaces/ReferenceProperty) ? [`ReferenceProperty`](/docs/api/interfaces/ReferenceProperty) : `P` *extends* [`ArrayProperty`](/docs/api/interfaces/ArrayProperty)\<`any`[], `any`\> ? [`ArrayProperty`](/docs/api/interfaces/ArrayProperty)\<`any`[], `any`\> : `P` *extends* [`MapProperty`](/docs/api/interfaces/MapProperty)\<`Record`\<`string`, [`CMSType`](/docs/api/type-aliases/CMSType)\>\> ? [`MapProperty`](/docs/api/interfaces/MapProperty)\<`Record`\<`string`, [`CMSType`](/docs/api/type-aliases/CMSType)\>\> : `P` *extends* [`PropertyBuilder`](/docs/api/type-aliases/PropertyBuilder)\<`T`, `M`\> ? [`PropertyBuilder`](/docs/api/type-aliases/PropertyBuilder)\<`T`, `M`\> : `never`
