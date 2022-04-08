---
id: "buildCollection"
title: "Function: buildCollection"
sidebar_label: "buildCollection"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildCollection**<`M`, `AdditionalKey`\>(`collectionView`): [`EntityCollection`](../interfaces/EntityCollection)<`M`, `AdditionalKey`\>

Identity function we use to defeat the type system of Typescript and build
collection views with all its properties

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |
| `AdditionalKey` | extends `string` = `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `collectionView` | [`EntityCollection`](../interfaces/EntityCollection)<`M`, `AdditionalKey`, `any`\> |

#### Returns

[`EntityCollection`](../interfaces/EntityCollection)<`M`, `AdditionalKey`\>

#### Defined in

[core/builders.ts:45](https://github.com/Camberi/firecms/blob/2d60fba/src/core/builders.ts#L45)
