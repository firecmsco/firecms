---
slug: "docs/api/functions/useInternalUserManagementController"
title: "useInternalUserManagementController"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / useInternalUserManagementController

# Function: useInternalUserManagementController()

> **useInternalUserManagementController**\<`USER`\>(): [`InternalUserManagement`](../type-aliases/InternalUserManagement)\<`USER`\>

Defined in: [hooks/useInternalUserManagementController.tsx:16](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useInternalUserManagementController.tsx)

Use this hook to get the internal user management of the app.
Note that this is different from the user management plugin controller.
This controller will be eventually replaced by the one provided
by the user management plugin.

Use at your own risk!

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User) = [`User`](../type-aliases/User)

## Returns

[`InternalUserManagement`](../type-aliases/InternalUserManagement)\<`USER`\>
