---
id: "PropertyPreviewProps"
title: "Interface: PropertyPreviewProps<T, CustomProps, M>"
sidebar_label: "PropertyPreviewProps"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType.md) = `any` |
| `CustomProps` | `any` |
| `M` | extends `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\> |

## Properties

### customProps

• `Optional` **customProps**: `CustomProps`

Additional properties set by the developer

#### Defined in

[packages/firecms_core/src/preview/PropertyPreviewProps.tsx:52](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/preview/PropertyPreviewProps.tsx#L52)

___

### entity

• `Optional` **entity**: [`Entity`](Entity.md)\<`M`\>

Entity this property refers to

#### Defined in

[packages/firecms_core/src/preview/PropertyPreviewProps.tsx:57](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/preview/PropertyPreviewProps.tsx#L57)

___

### height

• `Optional` **height**: `number`

Max height assigned to the preview, depending on the context.
It may be undefined if unlimited.

#### Defined in

[packages/firecms_core/src/preview/PropertyPreviewProps.tsx:41](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/preview/PropertyPreviewProps.tsx#L41)

___

### onClick

• `Optional` **onClick**: () => `void`

#### Type declaration

▸ (): `void`

Click handler

##### Returns

`void`

#### Defined in

[packages/firecms_core/src/preview/PropertyPreviewProps.tsx:30](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/preview/PropertyPreviewProps.tsx#L30)

___

### property

• **property**: [`Property`](../types/Property.md)\<`T`\> \| [`ResolvedProperty`](../types/ResolvedProperty.md)\<`T`\>

Property this display is related to

#### Defined in

[packages/firecms_core/src/preview/PropertyPreviewProps.tsx:25](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/preview/PropertyPreviewProps.tsx#L25)

___

### propertyKey

• `Optional` **propertyKey**: `string`

Name of the property

#### Defined in

[packages/firecms_core/src/preview/PropertyPreviewProps.tsx:15](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/preview/PropertyPreviewProps.tsx#L15)

___

### size

• **size**: [`PreviewSize`](../types/PreviewSize.md)

Desired size of the preview, depending on the context.

#### Defined in

[packages/firecms_core/src/preview/PropertyPreviewProps.tsx:35](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/preview/PropertyPreviewProps.tsx#L35)

___

### value

• **value**: `T`

Current value of the property

#### Defined in

[packages/firecms_core/src/preview/PropertyPreviewProps.tsx:20](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/preview/PropertyPreviewProps.tsx#L20)

___

### width

• `Optional` **width**: `number`

Max height width to the preview, depending on the context.
It may be undefined if unlimited.

#### Defined in

[packages/firecms_core/src/preview/PropertyPreviewProps.tsx:47](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/preview/PropertyPreviewProps.tsx#L47)
