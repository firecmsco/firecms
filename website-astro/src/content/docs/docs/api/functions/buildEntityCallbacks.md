---
slug: "docs/api/functions/buildEntityCallbacks"
title: "buildEntityCallbacks"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / buildEntityCallbacks

# Function: buildEntityCallbacks()

> **buildEntityCallbacks**\<`M`\>(`callbacks`): [`EntityCallbacks`](../type-aliases/EntityCallbacks)\<`M`\>

Defined in: [common/src/util/builders.ts:110](https://github.com/rebaseco/rebase/blob/main/packages/common/src/util/builders.ts)

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
