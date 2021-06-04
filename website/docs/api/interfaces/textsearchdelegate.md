---
id: "textsearchdelegate"
title: "Interface: TextSearchDelegate"
sidebar_label: "TextSearchDelegate"
sidebar_position: 0
custom_edit_url: null
---

Simple interface for implementing a text search

## Methods

### performTextSearch

▸ **performTextSearch**(`query`): `Promise`<readonly `string`[]\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `query` | `string` | string |

#### Returns

`Promise`<readonly `string`[]\>

array containing the Firestore ids of the search results

#### Defined in

[models/text_search_delegate.ts:11](https://github.com/Camberi/firecms/blob/42dd384/src/models/text_search_delegate.ts#L11)
