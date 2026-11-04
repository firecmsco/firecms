---
slug: "docs/api/functions/canEditEntity"
title: "canEditEntity"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / canEditEntity

# Function: canEditEntity()

> **canEditEntity**\<`M`, `USER`\>(`collection`, `authController`, `path`, `entity`): `boolean`

Defined in: [util/permissions.ts:37](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/permissions.ts)

## Type Parameters

### M

`M` *extends* `Record`\<`string`, `any`\>

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User)

## Parameters

### collection

[`EntityCollection`](/docs/api/interfaces/EntityCollection)\<`M`\>

### authController

[`AuthController`](/docs/api/type-aliases/AuthController)\<`USER`\>

### path

`string`

### entity

[`Entity`](/docs/api/interfaces/Entity)\<`M`\> | `null`

## Returns

`boolean`
