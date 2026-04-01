---
slug: "docs/api/type-aliases/JsonLogicRule"
title: "JsonLogicRule"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / JsonLogicRule

# Type Alias: JsonLogicRule

> **JsonLogicRule** = `Record`\<`string`, `any`\>

Defined in: [types/src/types/properties.ts:1018](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

A JSON Logic rule that gets evaluated at runtime.

## See

https://jsonlogic.com/

Common operators:
- Comparison: ==, !=, ===, !==, >, <, >=, <=
- Logic: and, or, !, !!
- Data access: var, missing, missing_some
- Array: in, map, filter, reduce, all, some, none, merge
- String: substr, cat
- Numeric: +, -, *, /, %, min, max

Custom operators:
- hasRole(roleId) - check if user has role by ID
- hasAnyRole([roleIds]) - check if user has any of the roles
- isToday(timestamp) - check if timestamp is today
- isPast(timestamp) - check if timestamp is in the past
- isFuture(timestamp) - check if timestamp is in the future
