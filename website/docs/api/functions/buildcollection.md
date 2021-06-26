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
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, S\> = [EntitySchema](../interfaces/entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |
| `AdditionalKey` | `AdditionalKey`: `string` = `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `collectionView` | [EntityCollectionView](../interfaces/entitycollectionview.md)<S, Key, AdditionalKey\> |

#### Returns

[EntityCollectionView](../interfaces/entitycollectionview.md)<S, Key, AdditionalKey\>

#### Defined in

[models/builders.ts:45](https://github.com/Camberi/firecms/blob/b1328ad/src/models/builders.ts#L45)
