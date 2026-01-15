---
slug: "docs/api/interfaces/MapProperty"
title: "MapProperty"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / MapProperty

# Interface: MapProperty\<T\>

Defined in: [types/properties.ts:526](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Extends

- [`BaseProperty`](BaseProperty)\<`T`\>

## Type Parameters

### T

`T` *extends* `Record`\<`string`, [`CMSType`](../type-aliases/CMSType)\> = `Record`\<`string`, [`CMSType`](../type-aliases/CMSType)\>

## Properties

### columnWidth?

> `optional` **columnWidth**: `number`

Defined in: [types/properties.ts:101](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

#### Inherited from

[`BaseProperty`](BaseProperty).[`columnWidth`](BaseProperty.md#columnwidth)

***

### customProps?

> `optional` **customProps**: `any`

Defined in: [types/properties.ts:148](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Inherited from

[`BaseProperty`](BaseProperty).[`customProps`](BaseProperty.md#customprops-1)

***

### dataType

> **dataType**: `"map"`

Defined in: [types/properties.ts:528](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Datatype of the property

#### Overrides

[`BaseProperty`](BaseProperty).[`dataType`](BaseProperty.md#datatype)

***

### defaultValue?

> `optional` **defaultValue**: `T` \| `null`

Defined in: [types/properties.ts:153](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

This value will be set by default for new entities.

#### Inherited from

[`BaseProperty`](BaseProperty).[`defaultValue`](BaseProperty.md#defaultvalue)

***

### description?

> `optional` **description**: `string`

Defined in: [types/properties.ts:82](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property description, always displayed under the field

#### Inherited from

[`BaseProperty`](BaseProperty).[`description`](BaseProperty.md#description)

***

### disabled?

> `optional` **disabled**: `boolean` \| [`PropertyDisabledConfig`](PropertyDisabledConfig)

Defined in: [types/properties.ts:121](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this field disabled.
When set to true, it gets rendered as a
disabled field. You can also specify a configuration for defining the
behaviour of disabled properties (including custom messages, clear value on
disabled or hide the field completely)

#### Inherited from

[`BaseProperty`](BaseProperty).[`disabled`](BaseProperty.md#disabled)

***

### editable?

> `optional` **editable**: `boolean`

Defined in: [types/properties.ts:159](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Should this property be editable. If set to true, the user will be able to modify the property and
save the new config. The saved config will then become the source of truth.

#### Inherited from

[`BaseProperty`](BaseProperty).[`editable`](BaseProperty.md#editable)

***

### expanded?

> `optional` **expanded**: `boolean`

Defined in: [types/properties.ts:578](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Should the field be initially expanded. Defaults to `true`

***

### Field?

> `optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps)\<`T`, `any`, `any`\>\>

Defined in: [types/properties.ts:135](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](BaseProperty).[`Field`](BaseProperty.md#field)

***

### hideFromCollection?

> `optional` **hideFromCollection**: `boolean`

Defined in: [types/properties.ts:106](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Do not show this property in the collection view

#### Inherited from

[`BaseProperty`](BaseProperty).[`hideFromCollection`](BaseProperty.md#hidefromcollection)

***

### keyValue?

> `optional` **keyValue**: `boolean`

Defined in: [types/properties.ts:584](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Render this map as a key-value table that allows to use
arbitrary keys. You don't need to define the properties in this case.

***

### longDescription?

> `optional` **longDescription**: `string`

Defined in: [types/properties.ts:95](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Longer description of a field, displayed under a popover

#### Inherited from

[`BaseProperty`](BaseProperty).[`longDescription`](BaseProperty.md#longdescription)

***

### minimalistView?

> `optional` **minimalistView**: `boolean`

Defined in: [types/properties.ts:573](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Display the child properties directly, without being wrapped in an
extendable panel. Note that this will also hide the title of this property.

***

### name?

> `optional` **name**: `string`

Defined in: [types/properties.ts:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property name (e.g. Product)

#### Inherited from

[`BaseProperty`](BaseProperty).[`name`](BaseProperty.md#name)

***

### pickOnlySomeKeys?

> `optional` **pickOnlySomeKeys**: `boolean`

Defined in: [types/properties.ts:561](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Allow the user to add only some keys in this map.
By default, all properties of the map have the corresponding field in
the form view. Setting this flag to true allows to pick only some.
Useful for map that can have a lot of sub-properties that may not be
needed

***

### Preview?

> `optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps)\<`T`, `any`\>\>

Defined in: [types/properties.ts:142](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](BaseProperty).[`Preview`](BaseProperty.md#preview)

***

### previewProperties?

> `optional` **previewProperties**: `Partial`\<`Extract`\<keyof `T`, `string`\>\>[]

Defined in: [types/properties.ts:552](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Properties that are displayed when rendered as a preview

***

### properties?

> `optional` **properties**: [`PropertiesOrBuilders`](../type-aliases/PropertiesOrBuilders)\<`T`\>

Defined in: [types/properties.ts:533](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Record of properties included in this map.

***

### propertiesOrder?

> `optional` **propertiesOrder**: `Extract`\<keyof `T`, `string`\>[]

Defined in: [types/properties.ts:540](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Order in which the properties are displayed.
If you are specifying your collection as code, the order is the same as the
one you define in `properties`, and you don't need to specify this prop.

***

### propertyConfig?

> `optional` **propertyConfig**: `string`

Defined in: [types/properties.ts:90](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

You can use this prop to reuse a property that has been defined
in the top level of the CMS in the prop `fields`.
All the configuration will be taken from the inherited config, and
overwritten by the current property config.

#### Inherited from

[`BaseProperty`](BaseProperty).[`propertyConfig`](BaseProperty.md#propertyconfig)

***

### readOnly?

> `optional` **readOnly**: `boolean`

Defined in: [types/properties.ts:112](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this a read only property. When set to true, it gets rendered as a
preview.

#### Inherited from

[`BaseProperty`](BaseProperty).[`readOnly`](BaseProperty.md#readonly)

***

### spreadChildren?

> `optional` **spreadChildren**: `boolean`

Defined in: [types/properties.ts:567](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Display the child properties as independent columns in the collection
view

***

### validation?

> `optional` **validation**: [`PropertyValidationSchema`](PropertyValidationSchema)

Defined in: [types/properties.ts:547](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Rules for validating this property.
NOTE: If you don't set `required` in the map property, an empty object
will be considered valid, even if you set `required` in the properties.

#### Overrides

[`BaseProperty`](BaseProperty).[`validation`](BaseProperty.md#validation)

***

### widthPercentage?

> `optional` **widthPercentage**: `number`

Defined in: [types/properties.ts:165](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

A number between 0 and 100 that indicates the width of the field in the form view.
It defaults to 100, but you can set it to 50 to have two fields in the same row.

#### Inherited from

[`BaseProperty`](BaseProperty).[`widthPercentage`](BaseProperty.md#widthpercentage)
