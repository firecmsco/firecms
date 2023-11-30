---
id: "FetchCollectionProps"
title: "Interface: FetchCollectionProps<M>"
sidebar_label: "FetchCollectionProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> = `any` |

## Properties

### collection

• **collection**: [`EntityCollection`](EntityCollection.md)\<`M`, `string`, [`User`](../types/User.md)\> \| [`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/types/datasource.ts:29](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L29)

___

### filter

• `Optional` **filter**: `Partial`\<`Record`\<`Extract`\<keyof `M`, `string`\>, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\>

#### Defined in

[packages/firecms_core/src/types/datasource.ts:30](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L30)

___

### limit

• `Optional` **limit**: `number`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:31](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L31)

___

### order

• `Optional` **order**: ``"desc"`` \| ``"asc"``

#### Defined in

[packages/firecms_core/src/types/datasource.ts:35](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L35)

___

### orderBy

• `Optional` **orderBy**: `string`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:33](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L33)

___

### path

• **path**: `string`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:28](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L28)

___

### searchString

• `Optional` **searchString**: `string`

#### Defined in

[packages/firecms_core/src/types/datasource.ts:34](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L34)

___

### startAfter

• `Optional` **startAfter**: `any`[]

#### Defined in

[packages/firecms_core/src/types/datasource.ts:32](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/datasource.ts#L32)
