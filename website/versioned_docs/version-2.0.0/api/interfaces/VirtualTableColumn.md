---
id: "VirtualTableColumn"
title: "Interface: VirtualTableColumn<CustomProps>"
sidebar_label: "VirtualTableColumn"
sidebar_position: 0
custom_edit_url: null
---

**`See`**

Table

## Type parameters

| Name | Type |
| :------ | :------ |
| `CustomProps` | extends `any` = `any` |

## Properties

### AdditionalHeaderWidget

• `Optional` **AdditionalHeaderWidget**: (`props`: \{ `onHover`: `boolean`  }) => `ReactNode`

#### Type declaration

▸ (`props`): `ReactNode`

Additional children to be rendered in the header when hovering

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.onHover` | `boolean` |

##### Returns

`ReactNode`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:223](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L223)

___

### align

• `Optional` **align**: ``"center"`` \| ``"left"`` \| ``"right"``

Alignment of the column cell

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:203](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L203)

___

### custom

• `Optional` **custom**: `CustomProps`

Custom props passed to the cell renderer

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:218](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L218)

___

### filter

• `Optional` **filter**: `boolean`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:197](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L197)

___

### frozen

• `Optional` **frozen**: `boolean`

This column is frozen to the left

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:182](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L182)

___

### headerAlign

• `Optional` **headerAlign**: ``"center"`` \| ``"left"`` \| ``"right"``

How is the

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:187](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L187)

___

### icon

• `Optional` **icon**: (`hoverOrOpen`: `boolean`) => `ReactNode`

#### Type declaration

▸ (`hoverOrOpen`): `ReactNode`

Icon displayed in the header

##### Parameters

| Name | Type |
| :------ | :------ |
| `hoverOrOpen` | `boolean` |

##### Returns

`ReactNode`

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:192](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L192)

___

### key

• **key**: `string`

Data key for the cell value, could be "a.b.c"

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:167](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L167)

___

### resizable

• `Optional` **resizable**: `boolean`

Can it be resized

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:213](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L213)

___

### sortable

• `Optional` **sortable**: `boolean`

Whether the column is sortable, defaults to false

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:208](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L208)

___

### title

• `Optional` **title**: `string`

Label displayed in the header

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:177](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L177)

___

### width

• **width**: `number`

The width of the column, gutter width is not included

#### Defined in

[packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx:172](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/components/VirtualTable/VirtualTableProps.tsx#L172)
