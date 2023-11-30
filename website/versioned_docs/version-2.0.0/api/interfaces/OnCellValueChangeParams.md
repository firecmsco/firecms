---
id: "OnCellValueChangeParams"
title: "Interface: OnCellValueChangeParams<T, M>"
sidebar_label: "OnCellValueChangeParams"
sidebar_position: 0
custom_edit_url: null
---

Props passed in a callback when the content of a cell in a table has been edited

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `M` | extends `Record`\<`string`, `any`\> |

## Properties

### context

• **context**: [`FireCMSContext`](../types/FireCMSContext.md)

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx:82](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx#L82)

___

### entity

• **entity**: [`Entity`](Entity.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx:78](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx#L78)

___

### fullPath

• **fullPath**: `string`

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx:81](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx#L81)

___

### onValueUpdated

• **onValueUpdated**: () => `void`

#### Type declaration

▸ (): `void`

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx:79](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx#L79)

___

### propertyKey

• **propertyKey**: `string`

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx:77](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx#L77)

___

### setError

• **setError**: (`e`: `Error`) => `void`

#### Type declaration

▸ (`e`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `e` | `Error` |

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx:80](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx#L80)

___

### value

• **value**: `T`

#### Defined in

[packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx:76](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/EntityCollectionTable/types.tsx#L76)
