---
id: "previewcomponentprops"
title: "Interface: PreviewComponentProps<T, CustomProps>"
sidebar_label: "PreviewComponentProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [CMSType](../types/cmstype.md) = [CMSType](../types/cmstype.md) |
| `CustomProps` | `CustomProps` = `any` |

## Properties

### customProps

• `Optional` **customProps**: `CustomProps`

Additional properties set by the developer

#### Defined in

[preview/preview_component_props.tsx:47](https://github.com/Camberi/firecms/blob/b1328ad/src/preview/preview_component_props.tsx#L47)

___

### height

• `Optional` **height**: `number`

Max height assigned to the preview, depending on the context.
It may be undefined if unlimited.

#### Defined in

[preview/preview_component_props.tsx:36](https://github.com/Camberi/firecms/blob/b1328ad/src/preview/preview_component_props.tsx#L36)

___

### name

• `Optional` **name**: `string`

Name of the property

#### Defined in

[preview/preview_component_props.tsx:10](https://github.com/Camberi/firecms/blob/b1328ad/src/preview/preview_component_props.tsx#L10)

___

### onClick

• `Optional` **onClick**: `MouseEventHandler`<any\>

Click handler

#### Defined in

[preview/preview_component_props.tsx:25](https://github.com/Camberi/firecms/blob/b1328ad/src/preview/preview_component_props.tsx#L25)

___

### property

• **property**: [Property](../types/property.md)<T\>

Property this display is related to

#### Defined in

[preview/preview_component_props.tsx:20](https://github.com/Camberi/firecms/blob/b1328ad/src/preview/preview_component_props.tsx#L20)

___

### size

• **size**: [PreviewSize](../types/previewsize.md)

Desired size of the preview, depending on the context.

#### Defined in

[preview/preview_component_props.tsx:30](https://github.com/Camberi/firecms/blob/b1328ad/src/preview/preview_component_props.tsx#L30)

___

### value

• **value**: `T`

Current value of the property

#### Defined in

[preview/preview_component_props.tsx:15](https://github.com/Camberi/firecms/blob/b1328ad/src/preview/preview_component_props.tsx#L15)

___

### width

• `Optional` **width**: `number`

Max height width to the preview, depending on the context.
It may be undefined if unlimited.

#### Defined in

[preview/preview_component_props.tsx:42](https://github.com/Camberi/firecms/blob/b1328ad/src/preview/preview_component_props.tsx#L42)
