---
slug: "docs/api/interfaces/BaseProperty"
title: "BaseProperty"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / BaseProperty

# Interface: BaseProperty\<CustomProps\>

Defined in: [types/src/types/properties.ts:105](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Interface including all common properties of a CMS property.

## Extended by

- [`StringProperty`](StringProperty)
- [`NumberProperty`](NumberProperty)
- [`BooleanProperty`](BooleanProperty)
- [`DateProperty`](DateProperty)
- [`GeopointProperty`](GeopointProperty)
- [`ReferenceProperty`](ReferenceProperty)
- [`RelationProperty`](RelationProperty)
- [`ArrayProperty`](ArrayProperty)
- [`MapProperty`](MapProperty)

## Type Parameters

### CustomProps

`CustomProps` = `any`

## Properties

### callbacks?

> `optional` **callbacks**: [`PropertyCallbacks`](../type-aliases/PropertyCallbacks)\<`any`, `any`, [`User`](../type-aliases/User)\>

Defined in: [types/src/types/properties.ts:212](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Callbacks/Hooks for this property field to transform and sanitize data during its lifecycle.

***

### columnWidth?

> `optional` **columnWidth**: `number`

Defined in: [types/src/types/properties.ts:128](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

***

### conditions?

> `optional` **conditions**: [`PropertyConditions`](PropertyConditions)

Defined in: [types/src/types/properties.ts:207](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Declarative conditions for dynamic property behavior using JSON Logic.

An alternative to PropertyBuilder functions that can be:
- Stored in the database as JSON
- Edited via the collection editor UI
- Evaluated at runtime like property builders

#### See

 - PropertyConditions for available condition options
 - https://jsonlogic.com/ for JSON Logic syntax

***

### customProps?

> `optional` **customProps**: `CustomProps`

Defined in: [types/src/types/properties.ts:170](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Additional props that are passed to the components defined in `field`
or in `preview`.

***

### defaultValue?

> `optional` **defaultValue**: `unknown`

Defined in: [types/src/types/properties.ts:158](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

This value will be set by default for new entities.

***

### description?

> `optional` **description**: `string`

Defined in: [types/src/types/properties.ts:114](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Property description, always displayed under the field

***

### disabled?

> `optional` **disabled**: `boolean` \| [`PropertyDisabledConfig`](PropertyDisabledConfig)

Defined in: [types/src/types/properties.ts:148](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Is this field disabled.
When set to true, it gets rendered as a
disabled field. You can also specify a configuration for defining the
behaviour of disabled properties (including custom messages, clear value on
disabled or hide the field completely)

***

### dynamicProps()?

> `optional` **dynamicProps**: (`props`) => `Partial`\<[`Property`](../type-aliases/Property)\>

Defined in: [types/src/types/properties.ts:194](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Use this to define dynamic properties that change based on certain conditions
or on the entity's values. For example, you can make a field read-only if
another field has a certain value.
This function receives the same props as a `PropertyBuilder` and should return a partial `Property` object.

#### Parameters

##### props

[`PropertyBuilderProps`](../type-aliases/PropertyBuilderProps)

#### Returns

`Partial`\<[`Property`](../type-aliases/Property)\>

***

### Field?

> `optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps)\<`any`, `CustomProps`, `any`\>\>

Defined in: [types/src/types/properties.ts:179](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

***

### hideFromCollection?

> `optional` **hideFromCollection**: `boolean`

Defined in: [types/src/types/properties.ts:133](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Do not show this property in the collection view

***

### name

> **name**: `string`

Defined in: [types/src/types/properties.ts:109](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Property name (e.g. Product)

***

### Preview?

> `optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps)\<`any`, `CustomProps`\>\>

Defined in: [types/src/types/properties.ts:186](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

***

### propertyConfig?

> `optional` **propertyConfig**: `string`

Defined in: [types/src/types/properties.ts:122](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

You can use this prop to reuse a property that has been defined
in the top level of the CMS in the prop `fields`.
All the configuration will be taken from the inherited config, and
overwritten by the current property config.

***

### readOnly?

> `optional` **readOnly**: `boolean`

Defined in: [types/src/types/properties.ts:139](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Is this a read only property. When set to true, it gets rendered as a
preview.

***

### validation?

> `optional` **validation**: [`PropertyValidationSchema`](PropertyValidationSchema)

Defined in: [types/src/types/properties.ts:153](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Rules for validating this property

***

### widthPercentage?

> `optional` **widthPercentage**: `number`

Defined in: [types/src/types/properties.ts:164](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

A number between 0 and 100 that indicates the width of the field in the form view.
It defaults to 100, but you can set it to 50 to have two fields in the same row.
