---
id: "Table"
title: "Function: Table"
sidebar_label: "Table"
sidebar_position: 0
custom_edit_url: null
---

▸ **Table**<`T`\>(`__namedParameters`): `Element`

This is a Table component that allows displaying arbitrary data, not
necessarily related to entities or properties. It is the component
that powers the entity collections but has a generic API so it
can be reused.

If you have an entity collection defined, you probably want to use
[CollectionTable](../variables/CollectionTable) or [EntityCollectionView](EntityCollectionView)

**`see`** CollectionTable

**`see`** EntityCollectionView

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`TableProps`](../interfaces/TableProps)<`T`\> |

#### Returns

`Element`

#### Defined in

[core/components/Table/Table.tsx:79](https://github.com/Camberi/firecms/blob/2d60fba/src/core/components/Table/Table.tsx#L79)
