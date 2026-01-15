---
slug: "docs/api/interfaces/DateProperty"
title: "DateProperty"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / DateProperty

# Interface: DateProperty

Defined in: [types/properties.ts:591](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Extends

- [`BaseProperty`](BaseProperty)\<`Date`\>

## Properties

### autoValue?

> `optional` **autoValue**: `"on_create"` \| `"on_update"`

Defined in: [types/properties.ts:613](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If this flag is  set to `on_create` or `on_update` this timestamp is
updated automatically on creation of the entity only or on every
update (including creation). Useful for creating `created_on` or
`updated_on` fields

***

### clearable?

> `optional` **clearable**: `boolean`

Defined in: [types/properties.ts:618](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Add an icon to clear the value and set it to `null`. Defaults to `false`

***

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

> **dataType**: `"date"`

Defined in: [types/properties.ts:593](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Datatype of the property

#### Overrides

[`BaseProperty`](BaseProperty).[`dataType`](BaseProperty.md#datatype)

***

### defaultValue?

> `optional` **defaultValue**: `Date` \| `null`

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

### Field?

> `optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps)\<`Date`, `any`, `any`\>\>

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

### longDescription?

> `optional` **longDescription**: `string`

Defined in: [types/properties.ts:95](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Longer description of a field, displayed under a popover

#### Inherited from

[`BaseProperty`](BaseProperty).[`longDescription`](BaseProperty.md#longdescription)

***

### mode?

> `optional` **mode**: `"date"` \| `"date_time"`

Defined in: [types/properties.ts:600](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Set the granularity of the field to a date or date + time.
Defaults to `date_time`.

***

### name?

> `optional` **name**: `string`

Defined in: [types/properties.ts:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property name (e.g. Product)

#### Inherited from

[`BaseProperty`](BaseProperty).[`name`](BaseProperty.md#name)

***

### Preview?

> `optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps)\<`Date`, `any`\>\>

Defined in: [types/properties.ts:142](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](BaseProperty).[`Preview`](BaseProperty.md#preview)

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

### validation?

> `optional` **validation**: [`DatePropertyValidationSchema`](DatePropertyValidationSchema)

Defined in: [types/properties.ts:605](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Rules for validating this property

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
