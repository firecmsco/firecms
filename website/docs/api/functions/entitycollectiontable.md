---
id: "entitycollectiontable"
title: "Function: EntityCollectionTable"
sidebar_label: "EntityCollectionTable"
sidebar_position: 0
custom_edit_url: null
---

▸ **EntityCollectionTable**<S, Key\>(`__namedParameters`): `Element`

This component is in charge of binding a Firestore path with an [EntityCollection](../interfaces/entitycollection.md)
where it's configuration is defined. This is useful if you have defined already
your entity collections and need to build a custom component.

If you need a lower level implementation with more granular options, you
can try CollectionTable, which still does data fetching from Firestore.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, any, S\> |
| `Key` | `Key`: `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `EntityCollectionProps`<S, Key\> |

#### Returns

`Element`

#### Defined in

[collection/EntityCollectionTable.tsx:58](https://github.com/Camberi/firecms/blob/42dd384/src/collection/EntityCollectionTable.tsx#L58)
