---
slug: "docs/api/functions/resolvePermissions"
title: "resolvePermissions"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / resolvePermissions

# Function: resolvePermissions()

> **resolvePermissions**\<`M`, `USER`\>(`collection`, `authController`, `path`, `entity`): [`Permissions`](/docs/api/interfaces/Permissions) \| `undefined`

Defined in: [util/permissions.ts:11](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/permissions.ts)

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

[`Permissions`](/docs/api/interfaces/Permissions) \| `undefined`
