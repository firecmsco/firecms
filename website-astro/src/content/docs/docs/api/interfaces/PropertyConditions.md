---
slug: "docs/api/interfaces/PropertyConditions"
title: "PropertyConditions"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / PropertyConditions

# Interface: PropertyConditions

Defined in: [types/src/types/properties.ts:1055](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Declarative conditions for dynamic property behavior.
All conditions are JSON Logic rules evaluated against ConditionContext.

An alternative to PropertyBuilder functions that can be:
- Stored in the database as JSON
- Edited via the collection editor UI
- Evaluated at runtime like property builders

## See

https://jsonlogic.com/ for JSON Logic syntax

## Properties

### acceptedFiles?

> `optional` **acceptedFiles**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1203](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Dynamic accepted file types.
Should evaluate to an array of MIME types.

***

### allowedEnumValues?

> `optional` **allowedEnumValues**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1157](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Filter which enum values are available.
Should evaluate to an array of allowed enum value IDs.

***

### canAddElements?

> `optional` **canAddElements**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1188](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Can elements be added to the array?

***

### clearOnDisabled?

> `optional` **clearOnDisabled**: `boolean`

Defined in: [types/src/types/properties.ts:1081](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Clear the field's value when it becomes disabled.

#### Default

```ts
false
```

***

### defaultValue?

> `optional` **defaultValue**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1131](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Dynamic default value for new entities.
Should evaluate to a value of the appropriate type for the field.
Only applied when entityId is empty (new entity).

***

### disabled?

> `optional` **disabled**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1070](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Disable the field when this condition evaluates to true.
The field becomes non-editable but still visible (unless also hidden).

#### Example

```ts
Disable when another field has a specific value
```json
{ "==": [{ "var": "values.status" }, "archived"] }
```
```

***

### disabledMessage?

> `optional` **disabledMessage**: `string`

Defined in: [types/src/types/properties.ts:1075](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Message to display when the field is disabled by a condition.

***

### enumConditions?

> `optional` **enumConditions**: `Record`\<`string` \| `number`, [`EnumValueConditions`](EnumValueConditions)\>

Defined in: [types/src/types/properties.ts:1151](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Conditions for individual enum values.
Keys are the enum value IDs, values are condition configs.

#### Example

```ts
Disable certain enum options based on user role
```json
{
  "admin": {
    "disabled": { "!": { "hasRole": "admin" } },
    "disabledMessage": "Admin option requires admin role"
  }
}
```
```

***

### excludedEnumValues?

> `optional` **excludedEnumValues**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1163](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Exclude specific enum values.
Should evaluate to an array of enum value IDs to exclude.

***

### hidden?

> `optional` **hidden**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1087](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Hide the field completely when this condition evaluates to true.
The field is removed from the form (not just visually hidden).

***

### max?

> `optional` **max**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1120](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Dynamic maximum value for number/string length.
Should evaluate to a number.

***

### maxFileSize?

> `optional` **maxFileSize**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1209](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Dynamic maximum file size in bytes.
Should evaluate to a number.

***

### min?

> `optional` **min**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1114](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Dynamic minimum value for number/string length.
Should evaluate to a number.

***

### readOnly?

> `optional` **readOnly**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1093](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Make the field read-only when this condition evaluates to true.
Renders as a preview instead of an input.

***

### referenceFilter?

> `optional` **referenceFilter**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1179](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Dynamic filter for reference selection.
Should evaluate to a FilterValues object.

***

### referencePath?

> `optional` **referencePath**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1173](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Dynamic path for reference properties.
Should evaluate to a collection path string.

***

### required?

> `optional` **required**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1103](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Make the field required when this condition evaluates to true.
Overrides the static `validation.required` setting.

***

### requiredMessage?

> `optional` **requiredMessage**: `string`

Defined in: [types/src/types/properties.ts:1108](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Custom message when conditional required validation fails.

***

### sortable?

> `optional` **sortable**: [`JsonLogicRule`](../type-aliases/JsonLogicRule)

Defined in: [types/src/types/properties.ts:1193](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Can elements be reordered in the array?
