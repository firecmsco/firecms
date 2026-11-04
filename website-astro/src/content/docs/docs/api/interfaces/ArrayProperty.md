---
slug: "docs/api/interfaces/ArrayProperty"
title: "ArrayProperty"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / ArrayProperty

# Interface: ArrayProperty\<T, ArrayT\>

Defined in: [types/properties.ts:439](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Extends

- [`BaseProperty`](/docs/api/interfaces/BaseProperty)\<`T`\>

## Type Parameters

### T

`T` *extends* `ArrayT`[] = `any`[]

### ArrayT

`ArrayT` *extends* [`CMSType`](/docs/api/type-aliases/CMSType) = `any`

## Properties

### canAddElements?

> `optional` **canAddElements**: `boolean`

Defined in: [types/properties.ts:519](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Can the elements in this array be added. Defaults to `true`
This prop has no effect if `disabled` is set to true.

***

### columnWidth?

> `optional` **columnWidth**: `number`

Defined in: [types/properties.ts:101](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`columnWidth`](/docs/api/interfaces/BaseProperty#columnwidth)

***

### customProps?

> `optional` **customProps**: `any`

Defined in: [types/properties.ts:148](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`customProps`](/docs/api/interfaces/BaseProperty#customprops-1)

***

### dataType

> **dataType**: `"array"`

Defined in: [types/properties.ts:441](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Datatype of the property

#### Overrides

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`dataType`](/docs/api/interfaces/BaseProperty#datatype)

***

### defaultValue?

> `optional` **defaultValue**: `T` \| `null`

Defined in: [types/properties.ts:153](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

This value will be set by default for new entities.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`defaultValue`](/docs/api/interfaces/BaseProperty#defaultvalue)

***

### description?

> `optional` **description**: `string`

Defined in: [types/properties.ts:82](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property description, always displayed under the field

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`description`](/docs/api/interfaces/BaseProperty#description)

***

### disabled?

> `optional` **disabled**: `boolean` \| [`PropertyDisabledConfig`](/docs/api/interfaces/PropertyDisabledConfig)

Defined in: [types/properties.ts:121](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this field disabled.
When set to true, it gets rendered as a
disabled field. You can also specify a configuration for defining the
behaviour of disabled properties (including custom messages, clear value on
disabled or hide the field completely)

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`disabled`](/docs/api/interfaces/BaseProperty#disabled)

***

### editable?

> `optional` **editable**: `boolean`

Defined in: [types/properties.ts:159](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Should this property be editable. If set to true, the user will be able to modify the property and
save the new config. The saved config will then become the source of truth.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`editable`](/docs/api/interfaces/BaseProperty#editable)

***

### expanded?

> `optional` **expanded**: `boolean`

Defined in: [types/properties.ts:501](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Should the field be initially expanded. Defaults to `true`

***

### Field?

> `optional` **Field**: `ComponentType`\<[`FieldProps`](/docs/api/interfaces/FieldProps)\<`T`, `any`, `any`\>\>

Defined in: [types/properties.ts:135](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`Field`](/docs/api/interfaces/BaseProperty#field)

***

### hideFromCollection?

> `optional` **hideFromCollection**: `boolean`

Defined in: [types/properties.ts:106](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Do not show this property in the collection view

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`hideFromCollection`](/docs/api/interfaces/BaseProperty#hidefromcollection)

***

### longDescription?

> `optional` **longDescription**: `string`

Defined in: [types/properties.ts:95](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Longer description of a field, displayed under a popover

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`longDescription`](/docs/api/interfaces/BaseProperty#longdescription)

***

### minimalistView?

> `optional` **minimalistView**: `boolean`

Defined in: [types/properties.ts:507](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Display the child properties directly, without being wrapped in an
extendable panel.

***

### name?

> `optional` **name**: `string`

Defined in: [types/properties.ts:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property name (e.g. Product)

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`name`](/docs/api/interfaces/BaseProperty#name)

***

### of?

> `optional` **of**: [`PropertyOrBuilder`](/docs/api/type-aliases/PropertyOrBuilder)\<`ArrayT`, `any`\> \| [`Property`](/docs/api/type-aliases/Property)\<`ArrayT`\>[]

Defined in: [types/properties.ts:449](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

The property of this array.
You can specify any property (except another Array property)
You can leave this field empty only if you are providing a custom field,
or using the `oneOf` prop, otherwise an error will be thrown.

***

### oneOf?

> `optional` **oneOf**: `object`

Defined in: [types/properties.ts:466](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Use this field if you would like to have an array of typed objects.
It is useful if you need to have values of different types in the same
array.
Each entry of the array is an object with the shape:
```
{ type: "YOUR_TYPE", value: "YOUR_VALUE"}
```
Note that you can use any property so `value` can take any value (strings,
numbers, array, objects...)
You can customise the `type` and `value` fields to suit your needs.

An example use case for this feature may be a blog entry, where you have
images and text blocks using markdown.

#### properties

> **properties**: [`Properties`](/docs/api/type-aliases/Properties)

Record of properties, where the key is the `type` and the value
is the corresponding property

#### propertiesOrder?

> `optional` **propertiesOrder**: `string`[]

Order in which the properties are displayed.
If you are specifying your collection as code, the order is the same as the
one you define in `properties`, and you don't need to specify this prop.

#### typeField?

> `optional` **typeField**: `string`

Name of the field to use as the discriminator for type
Defaults to `type`

#### valueField?

> `optional` **valueField**: `string`

Name of the  field to use as the value
Defaults to `value`

***

### Preview?

> `optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](/docs/api/interfaces/PropertyPreviewProps)\<`T`, `any`\>\>

Defined in: [types/properties.ts:142](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`Preview`](/docs/api/interfaces/BaseProperty#preview)

***

### propertyConfig?

> `optional` **propertyConfig**: `string`

Defined in: [types/properties.ts:90](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

You can use this prop to reuse a property that has been defined
in the top level of the CMS in the prop `fields`.
All the configuration will be taken from the inherited config, and
overwritten by the current property config.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`propertyConfig`](/docs/api/interfaces/BaseProperty#propertyconfig)

***

### readOnly?

> `optional` **readOnly**: `boolean`

Defined in: [types/properties.ts:112](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this a read only property. When set to true, it gets rendered as a
preview.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`readOnly`](/docs/api/interfaces/BaseProperty#readonly)

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [types/properties.ts:513](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Can the elements in this array be reordered. Defaults to `true`.
This prop has no effect if `disabled` is set to true.

***

### validation?

> `optional` **validation**: [`ArrayPropertyValidationSchema`](/docs/api/interfaces/ArrayPropertyValidationSchema)

Defined in: [types/properties.ts:496](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Rules for validating this property

#### Overrides

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`validation`](/docs/api/interfaces/BaseProperty#validation)

***

### widthPercentage?

> `optional` **widthPercentage**: `number`

Defined in: [types/properties.ts:165](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

A number between 0 and 100 that indicates the width of the field in the form view.
It defaults to 100, but you can set it to 50 to have two fields in the same row.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`widthPercentage`](/docs/api/interfaces/BaseProperty#widthpercentage)
