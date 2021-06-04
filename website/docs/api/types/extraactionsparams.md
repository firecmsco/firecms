---
id: "extraactionsparams"
title: "Type alias: ExtraActionsParams<S, Key>"
sidebar_label: "ExtraActionsParams"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **ExtraActionsParams**<S, Key\>: `Object`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> = [EntitySchema](../interfaces/entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `selectedEntities?` | [Entity](../interfaces/entity.md)<S, Key\>[] |
| `view` | [EntityCollectionView](../interfaces/entitycollectionview.md) |

#### Defined in

[models/models.ts:177](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L177)
