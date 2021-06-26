---
id: "collectionfetchprops"
title: "Interface: CollectionFetchProps<S, Key>"
sidebar_label: "CollectionFetchProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](entityschema.md)<Key\> |
| `Key` | `Key`: `string` |

## Properties

### collectionPath

• **collectionPath**: `string`

Absolute collection path

#### Defined in

[hooks/useCollectionFetch.tsx:16](https://github.com/Camberi/firecms/blob/b1328ad/src/hooks/useCollectionFetch.tsx#L16)

___

### currentSort

• `Optional` **currentSort**: `Order`

#### Defined in

[hooks/useCollectionFetch.tsx:36](https://github.com/Camberi/firecms/blob/b1328ad/src/hooks/useCollectionFetch.tsx#L36)

___

### entitiesDisplayedFirst

• `Optional` **entitiesDisplayedFirst**: [Entity](entity.md)<S, Key\>[]

List of entities that will be displayed on top, no matter the ordering.
This is used for reference fields selection

#### Defined in

[hooks/useCollectionFetch.tsx:30](https://github.com/Camberi/firecms/blob/b1328ad/src/hooks/useCollectionFetch.tsx#L30)

___

### filter

• `Optional` **filter**: `Partial`<{ [K in string]: [WhereFilterOp, any]}\>

#### Defined in

[hooks/useCollectionFetch.tsx:32](https://github.com/Camberi/firecms/blob/b1328ad/src/hooks/useCollectionFetch.tsx#L32)

___

### itemCount

• `Optional` **itemCount**: `number`

#### Defined in

[hooks/useCollectionFetch.tsx:24](https://github.com/Camberi/firecms/blob/b1328ad/src/hooks/useCollectionFetch.tsx#L24)

___

### schema

• **schema**: `S`

Schema of the entity displayed by this collection

#### Defined in

[hooks/useCollectionFetch.tsx:21](https://github.com/Camberi/firecms/blob/b1328ad/src/hooks/useCollectionFetch.tsx#L21)

___

### sortByProperty

• `Optional` **sortByProperty**: `string`

#### Defined in

[hooks/useCollectionFetch.tsx:34](https://github.com/Camberi/firecms/blob/b1328ad/src/hooks/useCollectionFetch.tsx#L34)
