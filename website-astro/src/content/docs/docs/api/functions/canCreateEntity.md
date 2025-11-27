---
slug: "docs/api/functions/canCreateEntity"
title: "canCreateEntity"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / canCreateEntity

# Function: canCreateEntity()

> **canCreateEntity**\<`M`, `USER`\>(`collection`, `authController`, `path`, `entity`): `boolean`

Defined in: [util/permissions.ts:46](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/permissions.ts)

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
