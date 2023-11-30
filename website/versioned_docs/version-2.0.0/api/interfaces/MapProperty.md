---
id: "MapProperty"
title: "Interface: MapProperty<T>"
sidebar_label: "MapProperty"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`\<`string`, [`CMSType`](../types/CMSType.md)\> = `Record`\<`string`, [`CMSType`](../types/CMSType.md)\> |

## Hierarchy

- [`BaseProperty`](BaseProperty.md)\<`T`\>

  ↳ **`MapProperty`**

## Properties

### Field

• `Optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps.md)\<`T`, `any`, `any`\>\>

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

• `Optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps.md)\<`T`, `any`, `Record`\<`string`, `any`\>\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[BaseProperty](BaseProperty.md).[Preview](BaseProperty.md#preview)

#### Defined in

[packages/firecms_core/src/types/properties.ts:140](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L140)

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

• **dataType**: ``"map"``

Datatype of the property

#### Overrides

[BaseProperty](BaseProperty.md).[dataType](BaseProperty.md#datatype)

#### Defined in

[packages/firecms_core/src/types/properties.ts:477](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L477)

___

### defaultValue

• `Optional` **defaultValue**: `T`

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

### expanded

• `Optional` **expanded**: `boolean`

Should the field be initially expanded. Defaults to `true`

#### Defined in

[packages/firecms_core/src/types/properties.ts:521](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L521)

___

### hideFromCollection

• `Optional` **hideFromCollection**: `boolean`

Do not show this property in the collection view

#### Inherited from

[BaseProperty](BaseProperty.md).[hideFromCollection](BaseProperty.md#hidefromcollection)

#### Defined in

[packages/firecms_core/src/types/properties.ts:104](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L104)

___

### keyValue

• `Optional` **keyValue**: `boolean`

Render this map as a key-value table that allows to use
arbitrary keys. You don't need to define the properties in this case.

#### Defined in

[packages/firecms_core/src/types/properties.ts:527](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L527)

___

### longDescription

• `Optional` **longDescription**: `string`

Longer description of a field, displayed under a popover

#### Inherited from

[BaseProperty](BaseProperty.md).[longDescription](BaseProperty.md#longdescription)

#### Defined in

[packages/firecms_core/src/types/properties.ts:93](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L93)

___

### name

• `Optional` **name**: `string`

Property name (e.g. Product)

#### Inherited from

[BaseProperty](BaseProperty.md).[name](BaseProperty.md#name)

#### Defined in

[packages/firecms_core/src/types/properties.ts:75](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L75)

___

### pickOnlySomeKeys

• `Optional` **pickOnlySomeKeys**: `boolean`

Allow the user to add only some keys in this map.
By default, all properties of the map have the corresponding field in
the form view. Setting this flag to true allows to pick only some.
Useful for map that can have a lot of sub-properties that may not be
needed

#### Defined in

[packages/firecms_core/src/types/properties.ts:510](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L510)

___

### previewProperties

• `Optional` **previewProperties**: `Partial`\<`Extract`\<keyof `T`, `string`\>\>[]

Properties that are displayed when rendered as a preview

#### Defined in

[packages/firecms_core/src/types/properties.ts:501](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L501)

___

### properties

• `Optional` **properties**: [`PropertiesOrBuilders`](../types/PropertiesOrBuilders.md)\<`T`\>

Record of properties included in this map.

#### Defined in

[packages/firecms_core/src/types/properties.ts:482](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L482)

___

### propertiesOrder

• `Optional` **propertiesOrder**: `Extract`\<keyof `T`, `string`\>[]

Order in which the properties are displayed.
If you are specifying your collection as code, the order is the same as the
one you define in `properties`, and you don't need to specify this prop.

#### Defined in

[packages/firecms_core/src/types/properties.ts:489](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L489)

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

### spreadChildren

• `Optional` **spreadChildren**: `boolean`

Display the child properties as independent columns in the collection
view

#### Defined in

[packages/firecms_core/src/types/properties.ts:516](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L516)

___

### validation

• `Optional` **validation**: [`PropertyValidationSchema`](PropertyValidationSchema.md)

Rules for validating this property.
NOTE: If you don't set `required` in the map property, an empty object
will be considered valid, even if you set `required` in the properties.

#### Overrides

[BaseProperty](BaseProperty.md).[validation](BaseProperty.md#validation)

#### Defined in

[packages/firecms_core/src/types/properties.ts:496](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L496)
