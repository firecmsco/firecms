---
id: "FirestoreTextSearchController"
title: "Type alias: FirestoreTextSearchController"
sidebar_label: "FirestoreTextSearchController"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FirestoreTextSearchController**: (`props`: { `path`: `string` ; `searchString`: `string`  }) => `Promise`<readonly `string`[]\> \| `undefined`

#### Type declaration

▸ (`props`): `Promise`<readonly `string`[]\> \| `undefined`

Use this controller to return a list of ids from a search index, given a
`path` and a `searchString`.
Firestore does not support text search directly so we need to rely on an external
index, such as Algolia.
Note that you will get text search requests for collections that have the
`textSearchEnabled` flag set to `true`.

**`see`** performAlgoliaTextSearch

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.path` | `string` |
| `props.searchString` | `string` |

##### Returns

`Promise`<readonly `string`[]\> \| `undefined`

#### Defined in

[firebase_app/models/text_search.ts:13](https://github.com/Camberi/firecms/blob/2d60fba/src/firebase_app/models/text_search.ts#L13)
