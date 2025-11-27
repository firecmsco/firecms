---
slug: "docs/api/functions/buildEntityCallbacks"
title: "buildEntityCallbacks"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / buildEntityCallbacks

# Function: buildEntityCallbacks()

> **buildEntityCallbacks**\<`M`\>(`callbacks`): [`EntityCallbacks`](../type-aliases/EntityCallbacks)\<`M`\>

Defined in: [util/builders.ts:113](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/builders.ts)

Identity function we use to defeat the type system of Typescript and preserve
the properties keys.

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

## Parameters

### callbacks

[`EntityCallbacks`](../type-aliases/EntityCallbacks)\<`M`\>

## Returns

[`EntityCallbacks`](../type-aliases/EntityCallbacks)\<`M`\>
