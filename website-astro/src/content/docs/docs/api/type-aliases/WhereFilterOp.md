---
slug: "docs/api/type-aliases/WhereFilterOp"
title: "WhereFilterOp"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / WhereFilterOp

# Type Alias: WhereFilterOp

> **WhereFilterOp** = `"<"` \| `"<="` \| `"=="` \| `"!="` \| `">="` \| `">"` \| `"array-contains"` \| `"in"` \| `"not-in"` \| `"array-contains-any"`

Defined in: [types/src/types/collections.ts:543](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/collections.ts)

Filter conditions in a `Query.where()` clause are specified using the
strings `<`, `<=`, `==`, `>=`, `>`, `array-contains`, `in`, and `array-contains-any`.
