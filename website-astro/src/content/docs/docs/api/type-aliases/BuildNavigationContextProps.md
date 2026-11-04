---
slug: "docs/api/type-aliases/BuildNavigationContextProps"
title: "BuildNavigationContextProps"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / BuildNavigationContextProps

# Type Alias: BuildNavigationContextProps\<EC, USER\>

> **BuildNavigationContextProps**\<`EC`, `USER`\> = `object`

Defined in: [hooks/useBuildNavigationController.tsx:40](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](/docs/api/interfaces/EntityCollection)

### USER

`USER` *extends* [`User`](/docs/api/type-aliases/User)

## Properties

### adminViews?

> `optional` **adminViews**: [`CMSView`](/docs/api/interfaces/CMSView)[] \| [`CMSViewsBuilder`](/docs/api/type-aliases/CMSViewsBuilder)

Defined in: [hooks/useBuildNavigationController.tsx:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

Custom views to be added to the CMS admin navigation.
This can be a static array of views or a function that returns a promise
resolving to an array of views.

***

### authController

> **authController**: [`AuthController`](/docs/api/type-aliases/AuthController)\<`USER`\>

Defined in: [hooks/useBuildNavigationController.tsx:54](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

The auth controller used to manage the user authentication and permissions.

***

### baseCollectionPath?

> `optional` **baseCollectionPath**: `string`

Defined in: [hooks/useBuildNavigationController.tsx:50](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

Base path for the collections, used to build the collection URLs.
Defaults to "c" (e.g. "/c/products").

***

### basePath?

> `optional` **basePath**: `string`

Defined in: [hooks/useBuildNavigationController.tsx:45](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

Base path for the CMS, used to build the all the URLs.
Defaults to "/".

***

### collectionPermissions?

> `optional` **collectionPermissions**: [`PermissionsBuilder`](/docs/api/type-aliases/PermissionsBuilder)

Defined in: [hooks/useBuildNavigationController.tsx:65](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

Optional permissions builder to be applied to the collections.
If not provided, the permissions will be resolved from the collection configuration.

***

### collections?

> `optional` **collections**: `EC`[] \| [`EntityCollectionsBuilder`](/docs/api/type-aliases/EntityCollectionsBuilder)\<`EC`\>

Defined in: [hooks/useBuildNavigationController.tsx:60](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

The collections to be used in the CMS.
This can be a static array of collections or a function that returns a promise
resolving to an array of collections.

***

### dataSourceDelegate

> **dataSourceDelegate**: [`DataSourceDelegate`](/docs/api/interfaces/DataSourceDelegate)

Defined in: [hooks/useBuildNavigationController.tsx:85](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

Delegate for data source operations, used to resolve collections and views.

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [hooks/useBuildNavigationController.tsx:97](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

If true, the navigation logic will not be updated until this flag is false

***

### navigationGroupMappings?

> `optional` **navigationGroupMappings**: [`NavigationGroupMapping`](/docs/api/interfaces/NavigationGroupMapping)[]

Defined in: [hooks/useBuildNavigationController.tsx:93](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

Used to define the name of groups and order of the navigation entries.

***

### plugins?

> `optional` **plugins**: [`FireCMSPlugin`](/docs/api/type-aliases/FireCMSPlugin)[]

Defined in: [hooks/useBuildNavigationController.tsx:89](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

Plugins to be used in the CMS.

***

### userConfigPersistence?

> `optional` **userConfigPersistence**: [`UserConfigurationPersistence`](/docs/api/interfaces/UserConfigurationPersistence)

Defined in: [hooks/useBuildNavigationController.tsx:81](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

Controller for storing user preferences.

***

### views?

> `optional` **views**: [`CMSView`](/docs/api/interfaces/CMSView)[] \| [`CMSViewsBuilder`](/docs/api/type-aliases/CMSViewsBuilder)

Defined in: [hooks/useBuildNavigationController.tsx:71](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

Custom views to be added to the CMS, these will be available in the main navigation.
This can be a static array of views or a function that returns a promise
resolving to an array of views.

***

### ~~viewsOrder?~~

> `optional` **viewsOrder**: `string`[]

Defined in: [hooks/useBuildNavigationController.tsx:103](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/hooks/useBuildNavigationController.tsx)

#### Deprecated

Use `navigationGroupMappings` instead.
