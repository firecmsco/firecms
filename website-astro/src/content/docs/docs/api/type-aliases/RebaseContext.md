---
slug: "docs/api/type-aliases/RebaseContext"
title: "RebaseContext"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RebaseContext

# Type Alias: RebaseContext\<USER, AuthControllerType\>

> **RebaseContext**\<`USER`, `AuthControllerType`\> = [`RebaseCallContext`](RebaseCallContext)\<`USER`\> & `object`

Defined in: [types/src/rebase\_context.tsx:47](https://github.com/rebaseco/rebase/blob/main/packages/types/src/rebase_context.tsx)

Context that includes the internal controllers and contexts used by the app.
Some controllers and context included in this context can be accessed
directly from their respective hooks.

## Type Declaration

### analyticsController?

> `optional` **analyticsController**: [`AnalyticsController`](AnalyticsController)

Callback to send analytics events

### authController?

> `optional` **authController**: `AuthControllerType`

Used auth controller

### customizationController?

> `optional` **customizationController**: [`CustomizationController`](CustomizationController)

This controller holds the customization options for the CMS.

### dialogsController?

> `optional` **dialogsController**: [`DialogsController`](../interfaces/DialogsController)

Controller used to open regular dialogs

### effectiveRoleController?

> `optional` **effectiveRoleController**: [`EffectiveRoleController`](../interfaces/EffectiveRoleController)

Controller to simulate different roles when dev mode is active.

### navigation?

> `optional` **navigation**: [`NavigationController`](NavigationController)

Context that includes the resolved navigation and utility methods and
attributes.

#### See

useNavigation

### sideDialogsController?

> `optional` **sideDialogsController**: [`SideDialogsController`](../interfaces/SideDialogsController)

Controller used to open side dialogs
This is the controller used internally by side entity dialogs
or reference dialogs.

### sideEntityController?

> `optional` **sideEntityController**: [`SideEntityController`](../interfaces/SideEntityController)

Controller to open the side dialog displaying entity forms

#### See

useSideEntityController

### snackbarController?

> `optional` **snackbarController**: [`SnackbarController`](../interfaces/SnackbarController)

Use this controller to display snackbars

### userConfigPersistence?

> `optional` **userConfigPersistence**: [`UserConfigurationPersistence`](../interfaces/UserConfigurationPersistence)

Use this controller to access data stored in the browser for the user

### userManagement?

> `optional` **userManagement**: [`UserManagementDelegate`](../interfaces/UserManagementDelegate)\<`USER`\>

This section is used to manage users in the CMS.
It is used to show user information in various places of the CMS,
for example, to show who created or modified an entity,
or to assign ownership of an entity.

In the base CMS, this information is not used for access control.
You can pass your own implementation of this section, to populate
the dropdown of users when assigning ownership of an entity,
or to show more information about the user.

If you are using the Rebase user management plugin, this
section will be implemented automatically.

## Type Parameters

### USER

`USER` *extends* [`User`](User) = [`User`](User)

### AuthControllerType

`AuthControllerType` *extends* [`AuthController`](AuthController)\<`USER`\> = [`AuthController`](AuthController)\<`USER`\>

## See

useRebaseContext
