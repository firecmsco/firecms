---
slug: "docs/api/functions/buildProperties"
title: "buildProperties"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / buildProperties

# Function: buildProperties()

> **buildProperties**\<`M`\>(`properties`): [`PropertiesOrBuilders`](/docs/api/type-aliases/PropertiesOrBuilders)\<`M`\>

Defined in: [util/builders.ts:65](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/builders.ts)

Identity function we use to defeat the type system of Typescript and preserve
the properties keys.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### properties

[`PropertiesOrBuilders`](/docs/api/type-aliases/PropertiesOrBuilders)\<`M`\>

## Returns

[`PropertiesOrBuilders`](/docs/api/type-aliases/PropertiesOrBuilders)\<`M`\>
