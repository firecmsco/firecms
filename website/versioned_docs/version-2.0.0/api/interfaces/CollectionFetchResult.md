---
id: "CollectionFetchResult"
title: "Interface: CollectionFetchResult<M>"
sidebar_label: "CollectionFetchResult"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |

## Properties

### data

• **data**: [`Entity`](Entity.md)\<`M`\>[]

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:47](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L47)

___

### dataLoading

• **dataLoading**: `boolean`

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:48](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L48)

___

### dataLoadingError

• `Optional` **dataLoadingError**: `Error`

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:50](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L50)

___

### noMoreToLoad

• **noMoreToLoad**: `boolean`

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:49](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L49)
