---
slug: "docs/api/functions/buildProperties"
title: "buildProperties"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / buildProperties

# Function: buildProperties()

> **buildProperties**\<`M`\>(`properties`): [`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`M`\>

Defined in: [util/builders.ts:65](https://github.com/rebaseco/rebase/blob/main/packages/core/src/util/builders.ts)

Identity function we use to defeat the type system of Typescript and preserve
the properties keys.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

## Parameters

### properties

[`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`M`\>

## Returns

[`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`M`\>
