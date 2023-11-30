---
id: "BaseProperty"
title: "Interface: BaseProperty<T, CustomProps>"
sidebar_label: "BaseProperty"
sidebar_position: 0
custom_edit_url: null
---

Interface including all common properties of a CMS property

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType.md) |
| `CustomProps` | `any` |

## Hierarchy

- **`BaseProperty`**

  ↳ [`NumberProperty`](NumberProperty.md)

  ↳ [`BooleanProperty`](BooleanProperty.md)

  ↳ [`StringProperty`](StringProperty.md)

  ↳ [`ArrayProperty`](ArrayProperty.md)

  ↳ [`MapProperty`](MapProperty.md)

  ↳ [`DateProperty`](DateProperty.md)

  ↳ [`GeopointProperty`](GeopointProperty.md)

  ↳ [`ReferenceProperty`](ReferenceProperty.md)

## Properties

### Field

• `Optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps.md)\<`T`, `CustomProps`, `any`\>\>

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Defined in

[packages/firecms_core/src/types/properties.ts:133](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L133)

___

### Preview

• `Optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps.md)\<`T`, `CustomProps`, `Record`\<`string`, `any`\>\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Defined in

[packages/firecms_core/src/types/properties.ts:140](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L140)

___

### columnWidth

• `Optional` **columnWidth**: `number`

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

#### Defined in

[packages/firecms_core/src/types/properties.ts:99](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L99)

___

### customProps

• `Optional` **customProps**: `CustomProps`

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Defined in

[packages/firecms_core/src/types/properties.ts:146](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L146)

___

### dataType

• **dataType**: ``"string"`` \| ``"number"`` \| ``"boolean"`` \| ``"map"`` \| ``"array"`` \| ``"date"`` \| ``"geopoint"`` \| ``"reference"``

Datatype of the property

#### Defined in

[packages/firecms_core/src/types/properties.ts:70](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L70)

___

### defaultValue

• `Optional` **defaultValue**: `T`

This value will be set by default for new entities.

#### Defined in

[packages/firecms_core/src/types/properties.ts:151](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L151)

___

### description

• `Optional` **description**: `string`

Property description, always displayed under the field

#### Defined in

[packages/firecms_core/src/types/properties.ts:80](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L80)

___

### disabled

• `Optional` **disabled**: `boolean` \| [`PropertyDisabledConfig`](PropertyDisabledConfig.md)

Is this field disabled.
When set to true, it gets rendered as a
disabled field. You can also specify a configuration for defining the
behaviour of disabled properties (including custom messages, clear value on
disabled or hide the field completely)

#### Defined in

[packages/firecms_core/src/types/properties.ts:119](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L119)

___

### editable

• `Optional` **editable**: `boolean`

Should this property be editable. If set to true, the user will be able to modify the property and
save the new config. The saved config will then become the source of truth.

#### Defined in

[packages/firecms_core/src/types/properties.ts:157](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L157)

___

### hideFromCollection

• `Optional` **hideFromCollection**: `boolean`

Do not show this property in the collection view

#### Defined in

[packages/firecms_core/src/types/properties.ts:104](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L104)

___

### longDescription

• `Optional` **longDescription**: `string`

Longer description of a field, displayed under a popover

#### Defined in

[packages/firecms_core/src/types/properties.ts:93](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L93)

___

### name

• `Optional` **name**: `string`

Property name (e.g. Product)

#### Defined in

[packages/firecms_core/src/types/properties.ts:75](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L75)

___

### propertyConfig

• `Optional` **propertyConfig**: `string`

You can use this prop to reuse a property that has been defined
in the top level of the CMS in the prop `fields`.
All the configuration will be taken from the inherited config, and
overwritten by the current property config.

#### Defined in

[packages/firecms_core/src/types/properties.ts:88](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L88)

___

### readOnly

• `Optional` **readOnly**: `boolean`

Is this a read only property. When set to true, it gets rendered as a
preview.

#### Defined in

[packages/firecms_core/src/types/properties.ts:110](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L110)

___

### validation

• `Optional` **validation**: [`PropertyValidationSchema`](PropertyValidationSchema.md)

Rules for validating this property

#### Defined in

[packages/firecms_core/src/types/properties.ts:124](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L124)
