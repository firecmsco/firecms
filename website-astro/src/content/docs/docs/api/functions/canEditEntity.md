---
slug: "docs/api/functions/canEditEntity"
title: "canEditEntity"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / canEditEntity

# Function: canEditEntity()

> **canEditEntity**\<`M`, `USER`\>(`collection`, `authController`, `path`, `entity`): `boolean`

Defined in: [common/src/util/permissions.ts:206](https://github.com/rebaseco/rebase/blob/main/packages/common/src/util/permissions.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Parameters

### collection

[`EntityCollection`](../interfaces/EntityCollection)\<`M`\>

### authController

[`AuthController`](../type-aliases/AuthController)\<`USER`\>

### path

`string`

### entity

[`Entity`](../interfaces/Entity)\<`M`\> | `null`

## Returns

`boolean`
