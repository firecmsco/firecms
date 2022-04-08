---
id: "FireCMSContext"
title: "Interface: FireCMSContext<UserType>"
sidebar_label: "FireCMSContext"
sidebar_position: 0
custom_edit_url: null
---

Context that includes the internal controllers and contexts used by the app.
Some controllers and context included in this context can be accessed
directly from their respective hooks.

**`see`** useFireCMSContext

## Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](../types/User) = [`User`](../types/User) |

## Properties

### authController

• **authController**: [`AuthController`](AuthController)<`UserType`\>

Used auth controller

#### Defined in

[models/firecms_context.tsx:57](https://github.com/Camberi/firecms/blob/2d60fba/src/models/firecms_context.tsx#L57)

___

### dataSource

• **dataSource**: [`DataSource`](DataSource)

Connector to your database, e.g. your Firestore database

#### Defined in

[models/firecms_context.tsx:34](https://github.com/Camberi/firecms/blob/2d60fba/src/models/firecms_context.tsx#L34)

___

### dateTimeFormat

• `Optional` **dateTimeFormat**: `string`

Format of the dates in the CMS.
Defaults to 'MMMM dd, yyyy, HH:mm:ss'

#### Defined in

[models/firecms_context.tsx:24](https://github.com/Camberi/firecms/blob/2d60fba/src/models/firecms_context.tsx#L24)

___

### entityLinkBuilder

• `Optional` **entityLinkBuilder**: [`EntityLinkBuilder`](../types/EntityLinkBuilder)<`any`\>

Builder for generating utility links for entities

#### Defined in

[models/firecms_context.tsx:62](https://github.com/Camberi/firecms/blob/2d60fba/src/models/firecms_context.tsx#L62)

___

### locale

• `Optional` **locale**: [`Locale`](../types/Locale)

Locale of the CMS, currently only affecting dates

#### Defined in

[models/firecms_context.tsx:29](https://github.com/Camberi/firecms/blob/2d60fba/src/models/firecms_context.tsx#L29)

___

### navigationContext

• **navigationContext**: [`NavigationContext`](../types/NavigationContext)

Context that includes the resolved navigation and utility methods and
attributes.

**`see`** useNavigation

#### Defined in

[models/firecms_context.tsx:46](https://github.com/Camberi/firecms/blob/2d60fba/src/models/firecms_context.tsx#L46)

___

### sideEntityController

• **sideEntityController**: [`SideEntityController`](SideEntityController)

Controller to open the side dialog displaying entity forms

**`see`** useSideEntityController

#### Defined in

[models/firecms_context.tsx:52](https://github.com/Camberi/firecms/blob/2d60fba/src/models/firecms_context.tsx#L52)

___

### snackbarController

• **snackbarController**: [`SnackbarController`](SnackbarController)

Use this controller to display snackbars

#### Defined in

[models/firecms_context.tsx:67](https://github.com/Camberi/firecms/blob/2d60fba/src/models/firecms_context.tsx#L67)

___

### storageSource

• **storageSource**: [`StorageSource`](StorageSource)

Used storage implementation

#### Defined in

[models/firecms_context.tsx:39](https://github.com/Camberi/firecms/blob/2d60fba/src/models/firecms_context.tsx#L39)
