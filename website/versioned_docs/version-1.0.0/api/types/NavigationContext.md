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
| `basePath` | `string` | Default path under the navigation routes of the CMS will be created |
| `homeUrl` | `string` | Base url path for the home screen |
| `initialised` | `boolean` | Is the registry ready to be used |
| `loading` | `boolean` | - |
| `navigation?` | [`Navigation`](../interfaces/Navigation) | - |
| `navigationLoadingError?` | `any` | - |
| `buildCMSUrlPath` | (`path`: `string`) => `string` | Convert a collection or entity path to a URL path |
| `buildUrlCollectionPath` | (`path`: `string`) => `string` | Build a URL collection path from a data path `products` => `/c/products` `products/B34SAP8Z` => `/c/products/B34SAP8Z` |
| `getCollectionResolver` | <M\>(`path`: `string`, `entityId?`: `string`, `baseCollection?`: [`EntityCollection`](../interfaces/EntityCollection)<`M`, `string`, `any`\>) => `undefined` \| [`EntityCollectionResolver`](EntityCollectionResolver)<`M`\> | Get the schema configuration for a given path. If you use this method you can use a baseCollection that will be used to resolve the initial properties of the collection, before applying the collection configuration changes that are persisted. If you don't specify it, the collection is fetched from the local navigation. |
| `isUrlCollectionPath` | (`urlPath`: `string`) => `boolean` | Check if a url path belongs to a collection |
| `onCollectionModifiedForUser` | <M\>(`path`: `string`, `partialCollection`: [`PartialEntityCollection`](PartialEntityCollection)<`M`\>) => `void` | Use this callback when a collection has been modified so it is persisted. |
| `removeAllOverridesExcept` | (`entityRefs`: { `entityId?`: `string` ; `path`: `string`  }[]) => `void` | Remove all keys not used |
| `setOverride` | <M\>(`props`: { `entityId?`: `string` ; `overrideSchemaRegistry?`: `boolean` ; `path`: `string` ; `schemaConfig?`: `Partial`<[`EntityCollectionResolver`](EntityCollectionResolver)\>  }) => `undefined` \| `string` | Set props for path |
| `urlPathToDataPath` | (`cmsPath`: `string`) => `string` | Convert a URL path to a collection or entity path `/c/products` => `products` `/my_cms/c/products/B34SAP8Z` => `products/B34SAP8Z` `/my_cms/my_view` => `my_view` |

#### Defined in

[models/navigation.ts:82](https://github.com/Camberi/firecms/blob/2d60fba/src/models/navigation.ts#L82)
