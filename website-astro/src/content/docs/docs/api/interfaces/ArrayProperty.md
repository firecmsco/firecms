---
slug: "docs/api/interfaces/ArrayProperty"
title: "ArrayProperty"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / ArrayProperty

# Interface: ArrayProperty

Defined in: [types/src/types/properties.ts:501](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

## Extends

- [`BaseProperty`](BaseProperty)

## Properties

### callbacks?

> `optional` **callbacks**: [`PropertyCallbacks`](../type-aliases/PropertyCallbacks)\<`any`, `any`, [`User`](../type-aliases/User)\>

Defined in: [types/src/types/properties.ts:212](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Callbacks/Hooks for this property field to transform and sanitize data during its lifecycle.

#### Inherited from

[`BaseProperty`](BaseProperty).[`callbacks`](BaseProperty.md#callbacks)

***

### canAddElements?

> `optional` **canAddElements**: `boolean`

Defined in: [types/src/types/properties.ts:574](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Can the elements in this array be added. Defaults to `true`
This prop has no effect if `disabled` is set to true.

***

### columnType?

> `optional` **columnType**: `"json"` \| `"jsonb"`

Defined in: [types/src/types/properties.ts:506](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Optional database column type. Defaults to `jsonb`.

***

### columnWidth?

> `optional` **columnWidth**: `number`

Defined in: [types/src/types/properties.ts:128](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

#### Inherited from

[`BaseProperty`](BaseProperty).[`columnWidth`](BaseProperty.md#columnwidth)

***

### conditions?

> `optional` **conditions**: [`PropertyConditions`](PropertyConditions)

Defined in: [types/src/types/properties.ts:207](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Declarative conditions for dynamic property behavior using JSON Logic.

An alternative to PropertyBuilder functions that can be:
- Stored in the database as JSON
- Edited via the collection editor UI
- Evaluated at runtime like property builders

#### See

 - PropertyConditions for available condition options
 - https://jsonlogic.com/ for JSON Logic syntax

#### Inherited from

[`BaseProperty`](BaseProperty).[`conditions`](BaseProperty.md#conditions)

***

### customProps?

> `optional` **customProps**: `any`

Defined in: [types/src/types/properties.ts:170](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Inherited from

[`BaseProperty`](BaseProperty).[`customProps`](BaseProperty.md#customprops-1)

***

### defaultValue?

> `optional` **defaultValue**: `unknown`

Defined in: [types/src/types/properties.ts:158](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

This value will be set by default for new entities.

#### Inherited from

[`BaseProperty`](BaseProperty).[`defaultValue`](BaseProperty.md#defaultvalue)

***

### description?

> `optional` **description**: `string`

Defined in: [types/src/types/properties.ts:114](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Property description, always displayed under the field

#### Inherited from

[`BaseProperty`](BaseProperty).[`description`](BaseProperty.md#description)

***

### disabled?

> `optional` **disabled**: `boolean` \| [`PropertyDisabledConfig`](PropertyDisabledConfig)

Defined in: [types/src/types/properties.ts:148](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Is this field disabled.
When set to true, it gets rendered as a
disabled field. You can also specify a configuration for defining the
behaviour of disabled properties (including custom messages, clear value on
disabled or hide the field completely)

#### Inherited from

[`BaseProperty`](BaseProperty).[`disabled`](BaseProperty.md#disabled)

***

### dynamicProps()?

> `optional` **dynamicProps**: (`props`) => `Partial`\<[`Property`](../type-aliases/Property)\>

Defined in: [types/src/types/properties.ts:194](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Use this to define dynamic properties that change based on certain conditions
or on the entity's values. For example, you can make a field read-only if
another field has a certain value.
This function receives the same props as a `PropertyBuilder` and should return a partial `Property` object.

#### Parameters

##### props

[`PropertyBuilderProps`](../type-aliases/PropertyBuilderProps)

#### Returns

`Partial`\<[`Property`](../type-aliases/Property)\>

#### Inherited from

[`BaseProperty`](BaseProperty).[`dynamicProps`](BaseProperty.md#dynamicprops)

***

### expanded?

> `optional` **expanded**: `boolean`

Defined in: [types/src/types/properties.ts:559](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Should the field be initially expanded. Defaults to `true`

***

### Field?

> `optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps)\<`any`, `any`, `any`\>\>

Defined in: [types/src/types/properties.ts:179](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

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

Defined in: [types/src/types/properties.ts:133](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Do not show this property in the collection view

#### Inherited from

[`BaseProperty`](BaseProperty).[`hideFromCollection`](BaseProperty.md#hidefromcollection)

***

### minimalistView?

> `optional` **minimalistView**: `boolean`

Defined in: [types/src/types/properties.ts:564](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Display the child properties directly, without being wrapped in an
extendable panel.

***

### name

> **name**: `string`

Defined in: [types/src/types/properties.ts:109](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Property name (e.g. Product)

#### Inherited from

[`BaseProperty`](BaseProperty).[`name`](BaseProperty.md#name)

***

### of?

> `optional` **of**: [`Property`](../type-aliases/Property)

Defined in: [types/src/types/properties.ts:513](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

The property of this array.
You can specify any property (except another Array property)
You can leave this field empty only if you are providing a custom field,
or using the `oneOf` prop, otherwise an error will be thrown.

***

### oneOf?

> `optional` **oneOf**: `object`

Defined in: [types/src/types/properties.ts:529](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

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

> **properties**: [`Properties`](../type-aliases/Properties)

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

> `optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps)\<`any`, `any`\>\>

Defined in: [types/src/types/properties.ts:186](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](BaseProperty).[`Preview`](BaseProperty.md#preview)

***

### propertyConfig?

> `optional` **propertyConfig**: `string`

Defined in: [types/src/types/properties.ts:122](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

You can use this prop to reuse a property that has been defined
in the top level of the CMS in the prop `fields`.
All the configuration will be taken from the inherited config, and
overwritten by the current property config.

#### Inherited from

[`BaseProperty`](BaseProperty).[`propertyConfig`](BaseProperty.md#propertyconfig)

***

### readOnly?

> `optional` **readOnly**: `boolean`

Defined in: [types/src/types/properties.ts:139](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Is this a read only property. When set to true, it gets rendered as a
preview.

#### Inherited from

[`BaseProperty`](BaseProperty).[`readOnly`](BaseProperty.md#readonly)

***

### sortable?

> `optional` **sortable**: `boolean`

Defined in: [types/src/types/properties.ts:569](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Can the elements in this array be reordered. Defaults to `true`.
This prop has no effect if `disabled` is set to true.

***

### type

> **type**: `"array"`

Defined in: [types/src/types/properties.ts:502](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

***

### validation?

> `optional` **validation**: [`ArrayPropertyValidationSchema`](ArrayPropertyValidationSchema)

Defined in: [types/src/types/properties.ts:555](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Rules for validating this property

#### Overrides

[`BaseProperty`](BaseProperty).[`validation`](BaseProperty.md#validation)

***

### widthPercentage?

> `optional` **widthPercentage**: `number`

Defined in: [types/src/types/properties.ts:164](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

A number between 0 and 100 that indicates the width of the field in the form view.
It defaults to 100, but you can set it to 50 to have two fields in the same row.

#### Inherited from

[`BaseProperty`](BaseProperty).[`widthPercentage`](BaseProperty.md#widthpercentage)
