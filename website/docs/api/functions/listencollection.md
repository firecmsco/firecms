---
id: "listencollection"
title: "Function: listenCollection"
sidebar_label: "listenCollection"
sidebar_position: 0
custom_edit_url: null
---

▸ **listenCollection**<S, Key\>(`path`, `schema`, `onSnapshot`, `onError?`, `filter?`, `limit?`, `startAfter?`, `orderBy?`, `order?`): () => `void`

Listen to a entities in a Firestore path

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, S\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |
| `schema` | `S` |
| `onSnapshot` | (`entity`: [Entity](../interfaces/entity.md)<S, Key\>[]) => `void` |
| `onError?` | (`error`: `Error`) => `void` |
| `filter?` | [FilterValues](../types/filtervalues.md)<S, Key\> |
| `limit?` | `number` |
| `startAfter?` | `any`[] |
| `orderBy?` | `string` |
| `order?` | ``"desc"`` \| ``"asc"`` |

#### Returns

`fn`

Function to cancel subscription

▸ (): `void`

##### Returns

`void`

#### Defined in

[models/firestore.ts:29](https://github.com/Camberi/firecms/blob/b1328ad/src/models/firestore.ts#L29)
