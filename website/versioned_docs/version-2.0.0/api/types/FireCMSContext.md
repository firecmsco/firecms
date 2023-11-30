---
id: "FireCMSContext"
title: "Type alias: FireCMSContext<UserType, AuthControllerType>"
sidebar_label: "FireCMSContext"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FireCMSContext**\<`UserType`, `AuthControllerType`\>: `Object`

Context that includes the internal controllers and contexts used by the app.
Some controllers and context included in this context can be accessed
directly from their respective hooks.

**`See`**

useFireCMSContext

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](User.md) = [`User`](User.md) |
| `AuthControllerType` | extends [`AuthController`](AuthController.md)\<`UserType`\> = [`AuthController`](AuthController.md)\<`UserType`\> |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `authController` | `AuthControllerType` | Used auth controller |
| `components?` | \{ `missingReference?`: `React.ComponentType`\<\{ `path`: `string`  }\>  } | - |
| `components.missingReference?` | `React.ComponentType`\<\{ `path`: `string`  }\> | Component to render when a reference is missing |
| `dataSource` | [`DataSource`](../interfaces/DataSource.md) | Connector to your database, e.g. your Firestore database |
| `dateTimeFormat?` | `string` | Format of the dates in the CMS. Defaults to 'MMMM dd, yyyy, HH:mm:ss' |
| `dialogsController` | `DialogsController` | Controller used to open regular dialogs |
| `entityLinkBuilder?` | [`EntityLinkBuilder`](EntityLinkBuilder.md) | Builder for generating utility links for entities |
| `entityViews?` | [`EntityCustomView`](EntityCustomView.md)[] | List of additional custom views for entities. You can use the key to reference the custom view in the `entityViews` prop of a collection. You can also define an entity view from the UI. |
| `fields` | `Record`\<`string`, [`PropertyConfig`](PropertyConfig.md)\> | Record of custom form fields to be used in the CMS. You can use the key to reference the custom field in the `propertyConfig` prop of a property in a collection. |
| `locale?` | [`Locale`](Locale.md) | Locale of the CMS, currently only affecting dates |
| `navigation` | [`NavigationContext`](NavigationContext.md) | Context that includes the resolved navigation and utility methods and attributes. **`See`** useNavigation |
| `onAnalyticsEvent?` | (`event`: [`CMSAnalyticsEvent`](CMSAnalyticsEvent.md), `data?`: `object`) => `void` | Callback used to get analytics events from the CMS |
| `plugins?` | [`FireCMSPlugin`](FireCMSPlugin.md)[] | Use plugins to modify the behaviour of the CMS. Currently, in ALPHA, and likely subject to change. |
| `sideDialogsController` | [`SideDialogsController`](../interfaces/SideDialogsController.md) | Controller used to open side dialogs This is the controller used internally by side entity dialogs or reference dialogs. |
| `sideEntityController` | [`SideEntityController`](../interfaces/SideEntityController.md) | Controller to open the side dialog displaying entity forms **`See`** useSideEntityController |
| `snackbarController` | [`SnackbarController`](../interfaces/SnackbarController.md) | Use this controller to display snackbars |
| `storageSource` | [`StorageSource`](../interfaces/StorageSource.md) | Used storage implementation |
| `userConfigPersistence?` | [`UserConfigurationPersistence`](../interfaces/UserConfigurationPersistence.md) | Use this controller to access data stored in the browser for the user |

#### Defined in

[packages/firecms_core/src/types/firecms_context.tsx:25](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/firecms_context.tsx#L25)
