---
id: "ReferenceProperty"
title: "Interface: ReferenceProperty"
sidebar_label: "ReferenceProperty"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`BaseProperty`](BaseProperty.md)\<[`EntityReference`](../classes/EntityReference.md)\>

  ↳ **`ReferenceProperty`**

## Properties

### Field

• `Optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps.md)\<[`EntityReference`](../classes/EntityReference.md), `any`, `any`\>\>

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

• `Optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps.md)\<[`EntityReference`](../classes/EntityReference.md), `any`, `Record`\<`string`, `any`\>\>\>

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

• **dataType**: ``"reference"``

Datatype of the property

#### Overrides

[BaseProperty](BaseProperty.md).[dataType](BaseProperty.md#datatype)

#### Defined in

[packages/firecms_core/src/types/properties.ts:584](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L584)

___

### defaultValue

• `Optional` **defaultValue**: [`EntityReference`](../classes/EntityReference.md)

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

### forceFilter

• `Optional` **forceFilter**: `Partial`\<`Record`\<`string`, [[`WhereFilterOp`](../types/WhereFilterOp.md), `any`]\>\>

Allow selection of entities that pass the given filter only.
e.g. `forceFilter: { age: [">=", 18] }`

#### Defined in

[packages/firecms_core/src/types/properties.ts:602](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L602)

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

### name

• `Optional` **name**: `string`

Property name (e.g. Product)

#### Inherited from

[BaseProperty](BaseProperty.md).[name](BaseProperty.md#name)

#### Defined in

[packages/firecms_core/src/types/properties.ts:75](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L75)

___

### path

• `Optional` **path**: `string`

Absolute collection path of the collection this reference points to.
The collection of the entity is inferred based on the root navigation, so
the filters and search delegate existing there are applied to this view
as well.
You can leave this prop undefined if the path is not yet know, e.g.
you are using a property builder and the path depends on a different
property.
Note that you can also use a collection alias.

#### Defined in

[packages/firecms_core/src/types/properties.ts:596](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L596)

___

### previewProperties

• `Optional` **previewProperties**: `string`[]

Properties that need to be rendered when displaying a preview of this
reference. If not specified the first 3 are used. Only the first 3
specified values are considered.

#### Defined in

[packages/firecms_core/src/types/properties.ts:609](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L609)

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

• `Optional` **validation**: [`PropertyValidationSchema`](PropertyValidationSchema.md)

Rules for validating this property

#### Inherited from

[BaseProperty](BaseProperty.md).[validation](BaseProperty.md#validation)

#### Defined in

[packages/firecms_core/src/types/properties.ts:124](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/properties.ts#L124)
