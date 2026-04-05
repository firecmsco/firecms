---
slug: "docs/api/functions/useInternalUserManagementController"
title: "useInternalUserManagementController"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / useInternalUserManagementController

# Function: useInternalUserManagementController()

> **useInternalUserManagementController**\<`USER`\>(): [`UserManagementDelegate`](../interfaces/UserManagementDelegate)\<`USER`\> \| `undefined`

Defined in: [core/src/hooks/useInternalUserManagementController.tsx:15](https://github.com/rebasepro/rebase/blob/main/packages/core/src/hooks/useInternalUserManagementController.tsx)

Use this hook to get the internal user management of the app.
Note that this is different from the user management plugin controller.
This controller will be eventually replaced by the one provided
by the user management plugin.

Use at your own risk!

## Type Parameters

### USER

`USER` *extends* [`User`](../type-aliases/User)

## Returns

[`UserManagementDelegate`](../interfaces/UserManagementDelegate)\<`USER`\> \| `undefined`
