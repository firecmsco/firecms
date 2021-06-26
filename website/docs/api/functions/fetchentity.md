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
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, S\> |
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

[models/firestore.ts:131](https://github.com/Camberi/firecms/blob/b1328ad/src/models/firestore.ts#L131)
