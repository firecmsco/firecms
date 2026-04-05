---
slug: "docs/api/interfaces/ConditionContext"
title: "ConditionContext"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ConditionContext

# Interface: ConditionContext

Defined in: [types/src/types/properties.ts:1217](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Context available during JSON Logic condition evaluation.
Mirrors PropertyBuilderProps but adapted for JSON serialization.

## Properties

### entityId?

> `optional` **entityId**: `string`

Defined in: [types/src/types/properties.ts:1242](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Entity ID. Undefined for new entities.

***

### index?

> `optional` **index**: `number`

Defined in: [types/src/types/properties.ts:1252](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Index of this property (only for array items).

***

### isNew

> **isNew**: `boolean`

Defined in: [types/src/types/properties.ts:1247](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Whether this is a new entity being created.

***

### now

> **now**: `number`

Defined in: [types/src/types/properties.ts:1269](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Current timestamp as Unix milliseconds.

***

### path

> **path**: `string`

Defined in: [types/src/types/properties.ts:1237](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Collection path (e.g., "products", "users/uid123/orders")

***

### previousValues

> **previousValues**: `Record`\<`string`, `any`\>

Defined in: [types/src/types/properties.ts:1227](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Previous values before the current edit session.

***

### propertyValue

> **propertyValue**: `unknown`

Defined in: [types/src/types/properties.ts:1232](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Current value of this property specifically.

***

### user

> **user**: `object`

Defined in: [types/src/types/properties.ts:1257](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Current authenticated user information.

#### displayName

> **displayName**: `string` \| `null`

#### email

> **email**: `string` \| `null`

#### photoURL

> **photoURL**: `string` \| `null`

#### roles

> **roles**: `string`[]

Role IDs the user has (extracted from Role[].id)

#### uid

> **uid**: `string`

***

### values

> **values**: `Record`\<`string`, `any`\>

Defined in: [types/src/types/properties.ts:1222](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Current form/entity values.
Date values are converted to Unix timestamps (milliseconds).
