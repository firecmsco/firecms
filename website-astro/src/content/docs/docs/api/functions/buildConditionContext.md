---
slug: "docs/api/functions/buildConditionContext"
title: "buildConditionContext"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / buildConditionContext

# Function: buildConditionContext()

> **buildConditionContext**(`params`): [`ConditionContext`](../interfaces/ConditionContext)

Defined in: [common/src/util/conditions.ts:119](https://github.com/rebaseco/rebase/blob/main/packages/common/src/util/conditions.ts)

Build a ConditionContext from the current property resolution context.

## Parameters

### params

#### authController

[`AuthController`](../type-aliases/AuthController)

#### entityId?

`string`

#### index?

`number`

#### path

`string`

#### previousValues?

`Record`\<`string`, `unknown`\>

#### propertyKey?

`string`

#### values?

`Record`\<`string`, `unknown`\>

## Returns

[`ConditionContext`](../interfaces/ConditionContext)
