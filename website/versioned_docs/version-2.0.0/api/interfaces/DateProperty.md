---
id: "DateProperty"
title: "Interface: DateProperty"
sidebar_label: "DateProperty"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`BaseProperty`](BaseProperty.md)\<`Date`\>

  ↳ **`DateProperty`**

## Properties

### Field

• `Optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps.md)\<`Date`, `any`, `any`\>\>

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Inherited from

[BaseProperty](BaseProperty.md).[Field](BaseProperty.md#field)

#### Defined in

[packages/firecms_core/src/types/properties.ts:133](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L133)

___

### Preview

• `Optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps.md)\<`Date`, `any`, `Record`\<`string`, `any`\>\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[BaseProperty](BaseProperty.md).[Preview](BaseProperty.md#preview)

#### Defined in

[packages/firecms_core/src/types/properties.ts:140](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L140)

___

### autoValue

• `Optional` **autoValue**: ``"on_create"`` \| ``"on_update"``

If this flag is  set to `on_create` or `on_update` this timestamp is
updated automatically on creation of the entity only or on every
update (including creation). Useful for creating `created_on` or
`updated_on` fields

#### Defined in

[packages/firecms_core/src/types/properties.ts:556](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L556)

___

### clearable

• `Optional` **clearable**: `boolean`

Add an icon to clear the value and set it to `null`. Defaults to `false`

#### Defined in

[packages/firecms_core/src/types/properties.ts:561](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L561)

___

### columnWidth

• `Optional` **columnWidth**: `number`

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

#### Inherited from

[BaseProperty](BaseProperty.md).[columnWidth](BaseProperty.md#columnwidth)

#### Defined in

[packages/firecms_core/src/types/properties.ts:99](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L99)

___

### customProps

• `Optional` **customProps**: `any`

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Inherited from

[BaseProperty](BaseProperty.md).[customProps](BaseProperty.md#customprops)

#### Defined in

[packages/firecms_core/src/types/properties.ts:146](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L146)

___

### dataType

• **dataType**: ``"date"``

Datatype of the property

#### Overrides

[BaseProperty](BaseProperty.md).[dataType](BaseProperty.md#datatype)

#### Defined in

[packages/firecms_core/src/types/properties.ts:536](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L536)

___

### defaultValue

• `Optional` **defaultValue**: `Date`

This value will be set by default for new entities.

#### Inherited from

[BaseProperty](BaseProperty.md).[defaultValue](BaseProperty.md#defaultvalue)

#### Defined in

[packages/firecms_core/src/types/properties.ts:151](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L151)

___

### description

• `Optional` **description**: `string`

Property description, always displayed under the field

#### Inherited from

[BaseProperty](BaseProperty.md).[description](BaseProperty.md#description)

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

#### Inherited from

[BaseProperty](BaseProperty.md).[disabled](BaseProperty.md#disabled)

#### Defined in

[packages/firecms_core/src/types/properties.ts:119](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L119)

___

### editable

• `Optional` **editable**: `boolean`

Should this property be editable. If set to true, the user will be able to modify the property and
save the new config. The saved config will then become the source of truth.

#### Inherited from

[BaseProperty](BaseProperty.md).[editable](BaseProperty.md#editable)

#### Defined in

[packages/firecms_core/src/types/properties.ts:157](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L157)

___

### hideFromCollection

• `Optional` **hideFromCollection**: `boolean`

Do not show this property in the collection view

#### Inherited from

[BaseProperty](BaseProperty.md).[hideFromCollection](BaseProperty.md#hidefromcollection)

#### Defined in

[packages/firecms_core/src/types/properties.ts:104](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L104)

___

### longDescription

• `Optional` **longDescription**: `string`

Longer description of a field, displayed under a popover

#### Inherited from

[BaseProperty](BaseProperty.md).[longDescription](BaseProperty.md#longdescription)

#### Defined in

[packages/firecms_core/src/types/properties.ts:93](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L93)

___

### mode

• `Optional` **mode**: ``"date"`` \| ``"date_time"``

Set the granularity of the field to a date or date + time.
Defaults to `date_time`.

#### Defined in

[packages/firecms_core/src/types/properties.ts:543](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L543)

___

### name

• `Optional` **name**: `string`

Property name (e.g. Product)

#### Inherited from

[BaseProperty](BaseProperty.md).[name](BaseProperty.md#name)

#### Defined in

[packages/firecms_core/src/types/properties.ts:75](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L75)

___

### propertyConfig

• `Optional` **propertyConfig**: `string`

You can use this prop to reuse a property that has been defined
in the top level of the CMS in the prop `fields`.
All the configuration will be taken from the inherited config, and
overwritten by the current property config.

#### Inherited from

[BaseProperty](BaseProperty.md).[propertyConfig](BaseProperty.md#propertyconfig)

#### Defined in

[packages/firecms_core/src/types/properties.ts:88](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L88)

___

### readOnly

• `Optional` **readOnly**: `boolean`

Is this a read only property. When set to true, it gets rendered as a
preview.

#### Inherited from

[BaseProperty](BaseProperty.md).[readOnly](BaseProperty.md#readonly)

#### Defined in

[packages/firecms_core/src/types/properties.ts:110](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L110)

___

### validation

• `Optional` **validation**: [`DatePropertyValidationSchema`](DatePropertyValidationSchema.md)

Rules for validating this property

#### Overrides

[BaseProperty](BaseProperty.md).[validation](BaseProperty.md#validation)

#### Defined in

[packages/firecms_core/src/types/properties.ts:548](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L548)
