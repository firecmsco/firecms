---
id: "buildcollection"
title: "Function: buildCollection"
sidebar_label: "buildCollection"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildCollection**<S, Key, AdditionalKey\>(`collectionView`): [EntityCollectionView](../interfaces/entitycollectionview.md)<S, Key, AdditionalKey\>

Identity function we use to defeat the type system of Typescript and build
collection views with all its properties

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, any, S\> = [EntitySchema](../interfaces/entityschema.md)<any, any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |
| `AdditionalKey` | `AdditionalKey`: `string` = `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `collectionView` | [EntityCollectionView](../interfaces/entitycollectionview.md)<S, Key, AdditionalKey\> |

#### Returns

[EntityCollectionView](../interfaces/entitycollectionview.md)<S, Key, AdditionalKey\>

#### Defined in

[models/builders.ts:41](https://github.com/Camberi/firecms/blob/42dd384/src/models/builders.ts#L41)
