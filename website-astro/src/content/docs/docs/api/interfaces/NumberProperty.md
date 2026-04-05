---
slug: "docs/api/interfaces/NumberProperty"
title: "NumberProperty"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / NumberProperty

# Interface: NumberProperty

Defined in: [types/src/types/properties.ts:312](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

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

### clearable?

> `optional` **clearable**: `boolean`

Defined in: [types/src/types/properties.ts:343](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Add an icon to clear the value and set it to `null`. Defaults to `false`

***

### columnType?

> `optional` **columnType**: `"bigint"` \| `"numeric"` \| `"integer"` \| `"real"` \| `"double precision"` \| `"serial"` \| `"bigserial"`

Defined in: [types/src/types/properties.ts:318](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Optional database column type. Allows specifying exact database numeric types.
If not provided, integer fields (where validation.integer is true or isId is true) default to `integer`, others to `numeric`.

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

### enum?

> `optional` **enum**: [`EnumValues`](../type-aliases/EnumValues)

Defined in: [types/src/types/properties.ts:339](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

You can use the enum values providing a map of possible
exclusive values the property can take, mapped to the label that it is
displayed in the dropdown.

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

### isId?

> `optional` **isId**: `string` \| `boolean`

Defined in: [types/src/types/properties.ts:333](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Marks this field as a Primary Key / Unique Identifier.
Framework behavior: Auto-maps to `collection.primaryKeys` internally if not explicitly set.
Drizzle append: `.primaryKey()`
UI behavior: Field value cannot be changed after creation.

You can set this to `"manual"` for a user-defined ID, or specify a generation strategy:
'increment' -> PostgreSQL `GENERATED BY DEFAULT AS IDENTITY` or auto-incrementing integer.
Or any other random string to act as a raw SQL default expression.

***

### name

> **name**: `string`

Defined in: [types/src/types/properties.ts:109](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Property name (e.g. Product)

#### Inherited from

[`BaseProperty`](BaseProperty).[`name`](BaseProperty.md#name)

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

### type

> **type**: `"number"`

Defined in: [types/src/types/properties.ts:313](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

***

### validation?

> `optional` **validation**: [`NumberPropertyValidationSchema`](NumberPropertyValidationSchema)

Defined in: [types/src/types/properties.ts:322](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

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
