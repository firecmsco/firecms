---
slug: "docs/api/functions/resolvePermissions"
title: "resolvePermissions"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / resolvePermissions

# Function: resolvePermissions()

> **resolvePermissions**\<`M`, `USER`\>(`collection`, `authController`, `path`, `entity`): [`Permissions`](../interfaces/Permissions) \| `undefined`

Defined in: [util/permissions.ts:11](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/util/permissions.ts)

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

[`Permissions`](../interfaces/Permissions) \| `undefined`
