---
id: "listenentityfromref"
title: "Function: listenEntityFromRef"
sidebar_label: "listenEntityFromRef"
sidebar_position: 0
custom_edit_url: null
---

▸ **listenEntityFromRef**<S, Key\>(`ref`, `schema`, `onSnapshot`): `Function`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, S\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `ref` | `firebase.firestore.DocumentReference` |
| `schema` | `S` |
| `onSnapshot` | (`entity`: [Entity](../interfaces/entity.md)<S, Key\>) => `void` |

#### Returns

`Function`

Function to cancel subscription

#### Defined in

[models/firestore.ts:176](https://github.com/Camberi/firecms/blob/b1328ad/src/models/firestore.ts#L176)
