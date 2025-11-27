---
slug: "docs/api/interfaces/UserConfigurationPersistence"
title: "UserConfigurationPersistence"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / UserConfigurationPersistence

# Interface: UserConfigurationPersistence

Defined in: [types/local\_config\_persistence.tsx:14](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/local_config_persistence.tsx)

This interface is in charge of defining the controller that persists
modifications to a collection or collection, and retrieves them back from
a data source, such as local storage or Firestore.

## Properties

### collapsedGroups

> **collapsedGroups**: `string`[]

Defined in: [types/local\_config\_persistence.tsx:21](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/local_config_persistence.tsx)

***

### favouritePaths

> **favouritePaths**: `string`[]

Defined in: [types/local\_config\_persistence.tsx:19](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/local_config_persistence.tsx)

***

### getCollectionConfig()

> **getCollectionConfig**: \<`M`\>(`path`) => [`PartialEntityCollection`](../type-aliases/PartialEntityCollection)\<`M`\>

Defined in: [types/local\_config\_persistence.tsx:16](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/local_config_persistence.tsx)

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

`string`

#### Returns

[`PartialEntityCollection`](../type-aliases/PartialEntityCollection)\<`M`\>

***

### onCollectionModified()

> **onCollectionModified**: \<`M`\>(`path`, `partialCollection`) => `void`

Defined in: [types/local\_config\_persistence.tsx:15](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/local_config_persistence.tsx)

#### Type Parameters

##### M

`M` *extends* `Record`\<`string`, `any`\> = `any`

#### Parameters

##### path

`string`

##### partialCollection

[`PartialEntityCollection`](../type-aliases/PartialEntityCollection)\<`M`\>

#### Returns

`void`

***

### recentlyVisitedPaths

> **recentlyVisitedPaths**: `string`[]

Defined in: [types/local\_config\_persistence.tsx:17](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/local_config_persistence.tsx)

***

### setCollapsedGroups()

> **setCollapsedGroups**: (`paths`) => `void`

Defined in: [types/local\_config\_persistence.tsx:22](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/local_config_persistence.tsx)

#### Parameters

##### paths

`string`[]

#### Returns

`void`

***

### setFavouritePaths()

> **setFavouritePaths**: (`paths`) => `void`

Defined in: [types/local\_config\_persistence.tsx:20](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/local_config_persistence.tsx)

#### Parameters

##### paths

`string`[]

#### Returns

`void`

***

### setRecentlyVisitedPaths()

> **setRecentlyVisitedPaths**: (`paths`) => `void`

Defined in: [types/local\_config\_persistence.tsx:18](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/local_config_persistence.tsx)

#### Parameters

##### paths

`string`[]

#### Returns

`void`
