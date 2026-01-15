---
slug: "docs/api/interfaces/BaseProperty"
title: "BaseProperty"
---

[**@firecms/core**](../README)

***

[@firecms/core](../README) / BaseProperty

# Interface: BaseProperty\<T, CustomProps\>

Defined in: [types/properties.ts:67](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Interface including all common properties of a CMS property

## Extended by

- [`NumberProperty`](NumberProperty)
- [`BooleanProperty`](BooleanProperty)
- [`StringProperty`](StringProperty)
- [`ArrayProperty`](ArrayProperty)
- [`MapProperty`](MapProperty)
- [`DateProperty`](DateProperty)
- [`GeopointProperty`](GeopointProperty)
- [`ReferenceProperty`](ReferenceProperty)

## Type Parameters

### T

`T` *extends* [`CMSType`](../type-aliases/CMSType)

### CustomProps

`CustomProps` = `any`

## Properties

### columnWidth?

> `optional` **columnWidth**: `number`

Defined in: [types/properties.ts:101](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

***

### customProps?

> `optional` **customProps**: `CustomProps`

Defined in: [types/properties.ts:148](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Additional props that are passed to the components defined in `field`
or in `preview`.

***

### dataType

> **dataType**: `"string"` \| `"number"` \| `"boolean"` \| `"map"` \| `"date"` \| `"reference"` \| `"geopoint"` \| `"array"`

Defined in: [types/properties.ts:72](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Datatype of the property

***

### defaultValue?

> `optional` **defaultValue**: `T` \| `null`

Defined in: [types/properties.ts:153](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

This value will be set by default for new entities.

***

### description?

> `optional` **description**: `string`

Defined in: [types/properties.ts:82](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property description, always displayed under the field

***

### disabled?

> `optional` **disabled**: `boolean` \| [`PropertyDisabledConfig`](PropertyDisabledConfig)

Defined in: [types/properties.ts:121](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this field disabled.
When set to true, it gets rendered as a
disabled field. You can also specify a configuration for defining the
behaviour of disabled properties (including custom messages, clear value on
disabled or hide the field completely)

***

### editable?

> `optional` **editable**: `boolean`

Defined in: [types/properties.ts:159](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Should this property be editable. If set to true, the user will be able to modify the property and
save the new config. The saved config will then become the source of truth.

***

### Field?

> `optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps)\<`T`, `CustomProps`, `any`\>\>

Defined in: [types/properties.ts:135](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

***

### hideFromCollection?

> `optional` **hideFromCollection**: `boolean`

Defined in: [types/properties.ts:106](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Do not show this property in the collection view

***

### longDescription?

> `optional` **longDescription**: `string`

Defined in: [types/properties.ts:95](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Longer description of a field, displayed under a popover

***

### name?

> `optional` **name**: `string`

Defined in: [types/properties.ts:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property name (e.g. Product)

***

### Preview?

> `optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps)\<`T`, `CustomProps`\>\>

Defined in: [types/properties.ts:142](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

***

### propertyConfig?

> `optional` **propertyConfig**: `string`

Defined in: [types/properties.ts:90](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

You can use this prop to reuse a property that has been defined
in the top level of the CMS in the prop `fields`.
All the configuration will be taken from the inherited config, and
overwritten by the current property config.

***

### readOnly?

> `optional` **readOnly**: `boolean`

Defined in: [types/properties.ts:112](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this a read only property. When set to true, it gets rendered as a
preview.

***

### validation?

> `optional` **validation**: [`PropertyValidationSchema`](PropertyValidationSchema)

Defined in: [types/properties.ts:126](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Rules for validating this property

***

### widthPercentage?

> `optional` **widthPercentage**: `number`

Defined in: [types/properties.ts:165](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

A number between 0 and 100 that indicates the width of the field in the form view.
It defaults to 100, but you can set it to 50 to have two fields in the same row.
