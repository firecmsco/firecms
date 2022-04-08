---
id: "PreviewComponentProps"
title: "Interface: PreviewComponentProps<T, CustomProps>"
sidebar_label: "PreviewComponentProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType) = [`CMSType`](../types/CMSType) |
| `CustomProps` | `any` |

## Properties

### customProps

• `Optional` **customProps**: `CustomProps`

Additional properties set by the developer

#### Defined in

[preview/PreviewComponentProps.tsx:53](https://github.com/Camberi/firecms/blob/2d60fba/src/preview/PreviewComponentProps.tsx#L53)

___

### height

• `Optional` **height**: `number`

Max height assigned to the preview, depending on the context.
It may be undefined if unlimited.

#### Defined in

[preview/PreviewComponentProps.tsx:42](https://github.com/Camberi/firecms/blob/2d60fba/src/preview/PreviewComponentProps.tsx#L42)

___

### name

• `Optional` **name**: `string`

Name of the property

#### Defined in

[preview/PreviewComponentProps.tsx:16](https://github.com/Camberi/firecms/blob/2d60fba/src/preview/PreviewComponentProps.tsx#L16)

___

### onClick

• `Optional` **onClick**: `MouseEventHandler`<`any`\>

Click handler

#### Defined in

[preview/PreviewComponentProps.tsx:31](https://github.com/Camberi/firecms/blob/2d60fba/src/preview/PreviewComponentProps.tsx#L31)

___

### property

• **property**: [`Property`](../types/Property)<`T`\>

Property this display is related to

#### Defined in

[preview/PreviewComponentProps.tsx:26](https://github.com/Camberi/firecms/blob/2d60fba/src/preview/PreviewComponentProps.tsx#L26)

___

### size

• **size**: [`PreviewSize`](../types/PreviewSize)

Desired size of the preview, depending on the context.

#### Defined in

[preview/PreviewComponentProps.tsx:36](https://github.com/Camberi/firecms/blob/2d60fba/src/preview/PreviewComponentProps.tsx#L36)

___

### value

• **value**: `T`

Current value of the property

#### Defined in

[preview/PreviewComponentProps.tsx:21](https://github.com/Camberi/firecms/blob/2d60fba/src/preview/PreviewComponentProps.tsx#L21)

___

### width

• `Optional` **width**: `number`

Max height width to the preview, depending on the context.
It may be undefined if unlimited.

#### Defined in

[preview/PreviewComponentProps.tsx:48](https://github.com/Camberi/firecms/blob/2d60fba/src/preview/PreviewComponentProps.tsx#L48)
