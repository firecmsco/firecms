---
id: "NavigationContext"
title: "Type alias: NavigationContext"
sidebar_label: "NavigationContext"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **NavigationContext**: `Object`

Context that includes the resolved navigation and utility methods and
attributes.

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `baseCollectionPath` | `string` | Default path under the collection routes of the CMS will be created |
| `baseLocation` | `string` | Location used as the base for routes. This is the location that will be used underneath, when the url changes while opening a side dialog |
| `basePath` | `string` | Default path under the navigation routes of the CMS will be created |
| `buildCMSUrlPath` | (`path`: `string`) => `string` | Convert a collection or entity path to a URL path |
| `buildUrlCollectionPath` | (`path`: `string`) => `string` | Build a URL collection path from a data path `products` => `/c/products` `products/B34SAP8Z` => `/c/products/B34SAP8Z` |
| `buildUrlEditCollectionPath` | (`props`: \{ `path`: `string`  }) => `string` | - |
| `collections` | [`EntityCollection`](../interfaces/EntityCollection.md)[] | List of the mapped collections in the CMS. Each entry relates to a collection in the root database. Each of the navigation entries in this field generates an entry in the main menu. |
| `getCollection` | \<EC\>(`pathOrAlias`: `string`, `entityId?`: `string`, `includeUserOverride?`: `boolean`) => `EC` \| `undefined` | Get the collection configuration for a given path. The collection is resolved from the given path or alias. |
| `getCollectionFromPaths` | \<EC\>(`pathSegments`: `string`[]) => `EC` \| `undefined` | Get the collection configuration from its parent path segments. |
| `getParentReferencesFromPath` | (`path`: `string`) => [`EntityReference`](../classes/EntityReference.md)[] | Retrieve all the related parent collections for a given path |
| `homeUrl` | `string` | Base url path for the home screen |
| `initialised` | `boolean` | Is the registry ready to be used |
| `isUrlCollectionPath` | (`urlPath`: `string`) => `boolean` | Check if a url path belongs to a collection |
| `loading` | `boolean` | Is the navigation loading (the configuration persistence has not loaded yet, or a specified navigation builder has not completed) |
| `navigationLoadingError?` | `any` | Was there an error while loading the navigation data |
| `refreshNavigation` | () => `void` | Call this method to recalculate the navigation |
| `resolveAliasesFrom` | (`pathWithAliases`: `string`) => `string` | Turn a path with aliases into a resolved path |
| `topLevelNavigation?` | [`TopNavigationResult`](TopNavigationResult.md) | Configuration for the views that should be displayed at the top level of the navigation (e.g. in the home page or the navigation drawer) |
| `urlPathToDataPath` | (`cmsPath`: `string`) => `string` | Convert a URL path to a collection or entity path `/c/products` => `products` `/my_cms/c/products/B34SAP8Z` => `products/B34SAP8Z` `/my_cms/my_view` => `my_view` |
| `views` | [`CMSView`](../interfaces/CMSView.md)[] | Custom additional views created by the developer, added to the main navigation |

#### Defined in

[packages/firecms_core/src/types/navigation.ts:9](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/navigation.ts#L9)
