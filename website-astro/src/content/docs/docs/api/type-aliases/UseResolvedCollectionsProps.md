---
slug: "docs/api/type-aliases/UseResolvedCollectionsProps"
title: "UseResolvedCollectionsProps"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / UseResolvedCollectionsProps

# Type Alias: UseResolvedCollectionsProps\<EC, USER\>

> **UseResolvedCollectionsProps**\<`EC`, `USER`\> = `object`

Defined in: [core/src/hooks/navigation/useResolvedCollections.ts:17](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedCollections.ts)

## Type Parameters

### EC

`EC` *extends* [`EntityCollection`](../interfaces/EntityCollection)

### USER

`USER` *extends* [`User`](User)

## Properties

### authController

> **authController**: [`AuthController`](AuthController)\<`USER`\>

Defined in: [core/src/hooks/navigation/useResolvedCollections.ts:18](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedCollections.ts)

***

### collectionRegistryController

> **collectionRegistryController**: [`CollectionRegistryController`](CollectionRegistryController)\<`EC`\> & `object`

Defined in: [core/src/hooks/navigation/useResolvedCollections.ts:23](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedCollections.ts)

#### Type Declaration

##### collectionRegistryRef

> **collectionRegistryRef**: `React.MutableRefObject`\<[`CollectionRegistry`](../classes/CollectionRegistry)\>

***

### collections?

> `optional` **collections**: `EC`[] \| [`EntityCollectionsBuilder`](EntityCollectionsBuilder)\<`EC`\>

Defined in: [core/src/hooks/navigation/useResolvedCollections.ts:19](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedCollections.ts)

***

### dataSource

> **dataSource**: [`DataSource`](../interfaces/DataSource)

Defined in: [core/src/hooks/navigation/useResolvedCollections.ts:20](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedCollections.ts)

***

### disabled?

> `optional` **disabled**: `boolean`

Defined in: [core/src/hooks/navigation/useResolvedCollections.ts:22](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedCollections.ts)

***

### plugins?

> `optional` **plugins**: [`RebasePlugin`](RebasePlugin)[]

Defined in: [core/src/hooks/navigation/useResolvedCollections.ts:21](https://github.com/rebaseco/rebase/blob/main/packages/core/src/hooks/navigation/useResolvedCollections.ts)
