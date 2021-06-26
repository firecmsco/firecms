---
id: "listenentity"
title: "Function: listenEntity"
sidebar_label: "listenEntity"
sidebar_position: 0
custom_edit_url: null
---

▸ **listenEntity**<S, Key\>(`path`, `entityId`, `schema`, `onSnapshot`): `Function`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, S\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |
| `entityId` | `string` |
| `schema` | `S` |
| `onSnapshot` | (`entity`: [Entity](../interfaces/entity.md)<S, Key\>) => `void` |

#### Returns

`Function`

Function to cancel subscription

#### Defined in

[models/firestore.ts:155](https://github.com/Camberi/firecms/blob/b1328ad/src/models/firestore.ts#L155)
