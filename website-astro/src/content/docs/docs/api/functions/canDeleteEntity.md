---
slug: "docs/api/functions/canDeleteEntity"
title: "canDeleteEntity"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / canDeleteEntity

# Function: canDeleteEntity()

> **canDeleteEntity**\<`M`, `USER`\>(`collection`, `authController`, `path`, `entity`): `boolean`

Defined in: [util/permissions.ts:56](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/permissions.ts)

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
