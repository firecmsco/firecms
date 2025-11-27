---
slug: "docs/api/type-aliases/FireCMSContext"
title: "FireCMSContext"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / FireCMSContext

# Type Alias: FireCMSContext\<USER, AuthControllerType\>

> **FireCMSContext**\<`USER`, `AuthControllerType`\> = `object`

Defined in: [types/firecms\_context.tsx:22](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Context that includes the internal controllers and contexts used by the app.
Some controllers and context included in this context can be accessed
directly from their respective hooks.

## See

useFireCMSContext

## Type Parameters

### USER

`USER` *extends* [`User`](User) = [`User`](User)

### AuthControllerType

`AuthControllerType` *extends* [`AuthController`](AuthController)\<`USER`\> = [`AuthController`](AuthController)\<`USER`\>

## Properties

### analyticsController?

> `optional` **analyticsController**: [`AnalyticsController`](AnalyticsController)

Defined in: [types/firecms\_context.tsx:82](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Callback to send analytics events

***

### authController

> **authController**: `AuthControllerType`

Defined in: [types/firecms\_context.tsx:62](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Used auth controller

***

### customizationController

> **customizationController**: [`CustomizationController`](CustomizationController)

Defined in: [types/firecms\_context.tsx:67](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

This controller holds the customization options for the CMS.

***

### dataSource

> **dataSource**: [`DataSource`](../interfaces/DataSource)

Defined in: [types/firecms\_context.tsx:27](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Connector to your database, e.g. your Firestore database

***

### dialogsController

> **dialogsController**: `DialogsController`

Defined in: [types/firecms\_context.tsx:57](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Controller used to open regular dialogs

***

### navigation

> **navigation**: [`NavigationController`](NavigationController)

Defined in: [types/firecms\_context.tsx:39](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Context that includes the resolved navigation and utility methods and
attributes.

#### See

useNavigation

***

### sideDialogsController

> **sideDialogsController**: [`SideDialogsController`](../interfaces/SideDialogsController)

Defined in: [types/firecms\_context.tsx:52](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Controller used to open side dialogs
This is the controller used internally by side entity dialogs
or reference dialogs.

***

### sideEntityController

> **sideEntityController**: [`SideEntityController`](../interfaces/SideEntityController)

Defined in: [types/firecms\_context.tsx:45](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Controller to open the side dialog displaying entity forms

#### See

useSideEntityController

***

### snackbarController

> **snackbarController**: [`SnackbarController`](../interfaces/SnackbarController)

Defined in: [types/firecms\_context.tsx:72](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Use this controller to display snackbars

***

### storageSource

> **storageSource**: [`StorageSource`](../interfaces/StorageSource)

Defined in: [types/firecms\_context.tsx:32](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Used storage implementation

***

### userConfigPersistence?

> `optional` **userConfigPersistence**: [`UserConfigurationPersistence`](../interfaces/UserConfigurationPersistence)

Defined in: [types/firecms\_context.tsx:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

Use this controller to access data stored in the browser for the user

***

### userManagement

> **userManagement**: [`InternalUserManagement`](InternalUserManagement)\<`USER`\>

Defined in: [types/firecms\_context.tsx:98](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/firecms_context.tsx)

This section is used to manage users in the CMS.
It is used to show user information in various places of the CMS,
for example, to show who created or modified an entity,
or to assign ownership of an entity.

In the base CMS, this information is not used for access control.
You can pass your own implementation of this section, to populate
the dropdown of users when assigning ownership of an entity,
or to show more information about the user.

If you are using the FireCMS user management plugin, this
section will be implemented automatically.
