---
slug: "docs/api/interfaces/EnumValueConditions"
title: "EnumValueConditions"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / EnumValueConditions

# Interface: EnumValueConditions

Defined in: [types/src/types/properties.ts:1024](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Conditions for individual enum values within a property.

## Properties

### disabled?

> `optional` **disabled**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1029](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Disable this enum option when condition is true.
The option appears grayed out and cannot be selected.

***

### disabledMessage?

> `optional` **disabledMessage**: `string`

Defined in: [types/src/types/properties.ts:1034](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Message explaining why this option is disabled.

***

### hidden?

> `optional` **hidden**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1040](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Completely hide this enum option when condition is true.
The option is removed from the dropdown/list.
