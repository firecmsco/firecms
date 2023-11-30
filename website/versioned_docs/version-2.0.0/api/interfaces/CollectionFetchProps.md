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
| `M` | extends `Record`\<`string`, `any`\> |

## Properties

### collection

• **collection**: [`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\>

collection of the entity displayed by this collection

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:20](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L20)

___

### filterValues

• `Optional` **filterValues**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\>

Filter the fetched data by the property

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:30](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L30)

___

### itemCount

• `Optional` **itemCount**: `number`

Number of entities to fetch

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:25](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L25)

___

### path

• **path**: `string`

Absolute collection path

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:15](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L15)

___

### searchString

• `Optional` **searchString**: `string`

Search string

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:40](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L40)

___

### sortBy

• `Optional` **sortBy**: [`Extract`\<keyof `M`, `string`\>, ``"desc"`` \| ``"asc"``]

Sort the results by

#### Defined in

[packages/firecms_core/src/hooks/data/useCollectionFetch.tsx:35](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useCollectionFetch.tsx#L35)
