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
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, any, S\> |
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

[models/firestore.ts:129](https://github.com/Camberi/firecms/blob/42dd384/src/models/firestore.ts#L129)
