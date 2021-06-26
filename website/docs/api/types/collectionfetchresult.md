---
id: "collectionfetchresult"
title: "Type alias: CollectionFetchResult<S, Key>"
sidebar_label: "CollectionFetchResult"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **CollectionFetchResult**<S, Key\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> |
| `Key` | `Key`: `string` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data` | [Entity](../interfaces/entity.md)<S, Key\>[] |
| `dataLoading` | `boolean` |
| `dataLoadingError?` | `Error` |
| `noMoreToLoad` | `boolean` |

#### Defined in

[hooks/useCollectionFetch.tsx:39](https://github.com/Camberi/firecms/blob/b1328ad/src/hooks/useCollectionFetch.tsx#L39)
