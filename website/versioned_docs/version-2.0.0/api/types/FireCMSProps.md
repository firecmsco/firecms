---
id: "FireCMSProps"
title: "Type alias: FireCMSProps<UserType>"
sidebar_label: "FireCMSProps"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FireCMSProps**\<`UserType`\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](User.md) |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `authController` | [`AuthController`](AuthController.md)\<`UserType`\> | Delegate for implementing your auth operations. |
| `baseCollectionPath?` | `string` | Path under the collection routes of the CMS will be created. Defaults to `/c`. |
| `basePath?` | `string` | Path under the navigation routes of the CMS will be created. Defaults to `/`. Internally FireCMS uses `react-router` to create the routes, the base path is attached to the `BrowserRouter` component. If you are using FireCMS in a subpath of your website, you can use this prop to specify the base path. |
| `children` | (`props`: \{ `context`: [`FireCMSContext`](FireCMSContext.md) ; `loading`: `boolean`  }) => `React.ReactNode` | Use this function to return the components you want to render under FireCMS |
| `collections?` | [`EntityCollection`](../interfaces/EntityCollection.md)[] \| [`EntityCollectionsBuilder`](EntityCollectionsBuilder.md) | List of the mapped collections in the CMS. Each entry relates to a collection in the root database. Each of the navigation entries in this field generates an entry in the main menu. |
| `components?` | \{ `missingReference?`: `React.ComponentType`\<\{ `path`: `string`  }\>  } | - |
| `components.missingReference?` | `React.ComponentType`\<\{ `path`: `string`  }\> | Component to render when a reference is missing |
| `dataSource` | [`DataSource`](../interfaces/DataSource.md) | Connector to your database |
| `dateTimeFormat?` | `string` | Format of the dates in the CMS. Defaults to 'MMMM dd, yyyy, HH:mm:ss' |
| `entityLinkBuilder?` | [`EntityLinkBuilder`](EntityLinkBuilder.md) | Optional link builder you can add to generate a button in your entity forms. The function must return a URL that gets opened when the button is clicked |
| `entityViews?` | [`EntityCustomView`](EntityCustomView.md)[] | List of additional custom views for entities. You can use the key to reference the custom view in the `entityViews` prop of a collection. You can also define an entity view from the UI. |
| `fields?` | `Record`\<`string`, [`PropertyConfig`](PropertyConfig.md)\> | Record of custom form fields to be used in the CMS. You can use the key to reference the custom field in the `propertyConfig` prop of a property in a collection. |
| `locale?` | [`Locale`](Locale.md) | Locale of the CMS, currently only affecting dates |
| `onAnalyticsEvent?` | (`event`: [`CMSAnalyticsEvent`](CMSAnalyticsEvent.md), `data?`: `object`) => `void` | Callback used to get analytics events from the CMS |
| `plugins?` | [`FireCMSPlugin`](FireCMSPlugin.md)[] | Use plugins to modify the behaviour of the CMS. Currently, in ALPHA, and likely subject to change. |
| `storageSource` | [`StorageSource`](../interfaces/StorageSource.md) | Connector to your file upload/fetch implementation |
| `userConfigPersistence?` | [`UserConfigurationPersistence`](../interfaces/UserConfigurationPersistence.md) | Use this controller to access the configuration that is stored locally, and not defined in code |
| `views?` | [`CMSView`](../interfaces/CMSView.md)[] \| [`CMSViewsBuilder`](CMSViewsBuilder.md) | Custom additional views created by the developer, added to the main navigation |

#### Defined in

[packages/firecms_core/src/types/firecms.tsx:50](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/firecms.tsx#L50)
