---
id: "fetchentity"
title: "Function: fetchEntity"
sidebar_label: "fetchEntity"
sidebar_position: 0
custom_edit_url: null
---

▸ **fetchEntity**<S, Key\>(`path`, `entityId`, `schema`): `Promise`<[Entity](../interfaces/entity.md)<S, Key\>\>

Retrieve an entity given a path and a schema

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, any, S\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |
| `entityId` | `string` |
| `schema` | `S` |

#### Returns

`Promise`<[Entity](../interfaces/entity.md)<S, Key\>\>

#### Defined in

[models/firestore.ts:84](https://github.com/Camberi/firecms/blob/42dd384/src/models/firestore.ts#L84)
