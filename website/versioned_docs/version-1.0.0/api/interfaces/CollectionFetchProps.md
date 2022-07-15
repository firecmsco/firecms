---
id: "CollectionFetchProps"
title: "Interface: CollectionFetchProps<M>"
sidebar_label: "CollectionFetchProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Object` |

## Properties

### entitiesDisplayedFirst

• `Optional` **entitiesDisplayedFirst**: [`Entity`](Entity)<`M`\>[]

List of entities that will be displayed on top, no matter the ordering.
This is used for reference fields selection

#### Defined in

[hooks/data/useCollectionFetch.tsx:29](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/useCollectionFetch.tsx#L29)

___

### filterValues

• `Optional` **filterValues**: [`FilterValues`](../types/FilterValues)<`M`\>

Filter the fetched data by the property

#### Defined in

[hooks/data/useCollectionFetch.tsx:34](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/useCollectionFetch.tsx#L34)

___

### itemCount

• `Optional` **itemCount**: `number`

Number of entities to fetch

#### Defined in

[hooks/data/useCollectionFetch.tsx:23](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/useCollectionFetch.tsx#L23)

___

### path

• **path**: `string`

Absolute collection path

#### Defined in

[hooks/data/useCollectionFetch.tsx:13](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/useCollectionFetch.tsx#L13)

___

### schemaResolver

• **schemaResolver**: [`EntitySchemaResolver`](../types/EntitySchemaResolver)<`M`\>

Schema of the entity displayed by this collection

#### Defined in

[hooks/data/useCollectionFetch.tsx:18](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/useCollectionFetch.tsx#L18)

___

### searchString

• `Optional` **searchString**: `string`

Search string

#### Defined in

[hooks/data/useCollectionFetch.tsx:44](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/useCollectionFetch.tsx#L44)

___

### sortBy

• `Optional` **sortBy**: [`Extract`<keyof `M`, `string`\>, ``"asc"`` \| ``"desc"``]

Sort the results by

#### Defined in

[hooks/data/useCollectionFetch.tsx:39](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/useCollectionFetch.tsx#L39)
