---
slug: "docs/api/type-aliases/DeepPartial"
title: "DeepPartial"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / DeepPartial

# Type Alias: DeepPartial\<T\>

> **DeepPartial**\<`T`\> = `T` *extends* `object` ? `{ [K in keyof T]?: DeepPartial<T[K]> }` : `T`

Defined in: types/src/types/translations.ts:5

Recursively makes all properties optional.
Used to type partial translation overrides.

## Type Parameters

### T

`T`
