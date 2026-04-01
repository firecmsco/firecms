---
slug: "docs/api/interfaces/RelationProperty"
title: "RelationProperty"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / RelationProperty

# Interface: RelationProperty

Defined in: [types/src/types/properties.ts:450](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

## Extends

- [`BaseProperty`](BaseProperty)

## Properties

### callbacks?

> `optional` **callbacks**: [`PropertyCallbacks`](../type-aliases/PropertyCallbacks)\<`any`, `any`, [`User`](../type-aliases/User)\>

Defined in: [types/src/types/properties.ts:212](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Callbacks/Hooks for this property field to transform and sanitize data during its lifecycle.

#### Inherited from

[`BaseProperty`](BaseProperty).[`callbacks`](BaseProperty.md#callbacks)

***

### columnWidth?

> `optional` **columnWidth**: `number`

Defined in: [types/src/types/properties.ts:128](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Width in pixels of this column in the collection view. If not set
the width is inferred based on the other configurations

#### Inherited from

[`BaseProperty`](BaseProperty).[`columnWidth`](BaseProperty.md#columnwidth)

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

#### Inherited from

[`BaseProperty`](BaseProperty).[`conditions`](BaseProperty.md#conditions)

***

### customProps?

> `optional` **customProps**: `any`

Defined in: [types/src/types/properties.ts:170](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Inherited from

[`BaseProperty`](BaseProperty).[`customProps`](BaseProperty.md#customprops-1)

***

### defaultValue?

> `optional` **defaultValue**: `unknown`

Defined in: [types/src/types/properties.ts:158](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

This value will be set by default for new entities.

#### Inherited from

[`BaseProperty`](BaseProperty).[`defaultValue`](BaseProperty.md#defaultvalue)

***

### description?

> `optional` **description**: `string`

Defined in: [types/src/types/properties.ts:114](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Property description, always displayed under the field

#### Inherited from

[`BaseProperty`](BaseProperty).[`description`](BaseProperty.md#description)

***

### disabled?

> `optional` **disabled**: `boolean` \| [`PropertyDisabledConfig`](PropertyDisabledConfig)

Defined in: [types/src/types/properties.ts:148](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

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

#### Inherited from

[`BaseProperty`](BaseProperty).[`dynamicProps`](BaseProperty.md#dynamicprops)

***

### Field?

> `optional` **Field**: `ComponentType`\<[`FieldProps`](FieldProps)\<`any`, `any`, `any`\>\>

Defined in: [types/src/types/properties.ts:179](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](BaseProperty).[`Field`](BaseProperty.md#field)

***

### forceFilter?

> `optional` **forceFilter**: `Partial`\<`Record`\<`string`, \[[`WhereFilterOp`](../type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/src/types/properties.ts:475](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Allow selection of entities that pass the given filter only.
e.g. `forceFilter: { age: [">=", 18] }`

***

### hideFromCollection?

> `optional` **hideFromCollection**: `boolean`

Defined in: [types/src/types/properties.ts:133](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Do not show this property in the collection view

#### Inherited from

[`BaseProperty`](BaseProperty).[`hideFromCollection`](BaseProperty.md#hidefromcollection)

***

### includeEntityLink?

> `optional` **includeEntityLink**: `boolean`

Defined in: [types/src/types/properties.ts:489](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Should the reference include a link to the entity (open the entity details). Defaults to `true`

***

### includeId?

> `optional` **includeId**: `boolean`

Defined in: [types/src/types/properties.ts:485](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Should the reference include the ID of the entity. Defaults to `true`

***

### isId?

> `optional` **isId**: `boolean`

Defined in: [types/src/types/properties.ts:458](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Marks this field as a Primary Key / Unique Identifier.
Framework behavior: Auto-maps to `collection.primaryKeys` internally if not explicitly set.
Drizzle append: `.primaryKey()`
UI behavior: Field value cannot be changed after creation.

***

### name

> **name**: `string`

Defined in: [types/src/types/properties.ts:109](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Property name (e.g. Product)

#### Inherited from

[`BaseProperty`](BaseProperty).[`name`](BaseProperty.md#name)

***

### Preview?

> `optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](PropertyPreviewProps)\<`any`, `any`\>\>

Defined in: [types/src/types/properties.ts:186](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](BaseProperty).[`Preview`](BaseProperty.md#preview)

***

### previewProperties?

> `optional` **previewProperties**: `string`[]

Defined in: [types/src/types/properties.ts:481](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Properties that need to be rendered when displaying a preview of this
reference. If not specified the first 3 are used. Only the first 3
specified values are considered.

***

### propertyConfig?

> `optional` **propertyConfig**: `string`

Defined in: [types/src/types/properties.ts:122](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

You can use this prop to reuse a property that has been defined
in the top level of the CMS in the prop `fields`.
All the configuration will be taken from the inherited config, and
overwritten by the current property config.

#### Inherited from

[`BaseProperty`](BaseProperty).[`propertyConfig`](BaseProperty.md#propertyconfig)

***

### readOnly?

> `optional` **readOnly**: `boolean`

Defined in: [types/src/types/properties.ts:139](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Is this a read only property. When set to true, it gets rendered as a
preview.

#### Inherited from

[`BaseProperty`](BaseProperty).[`readOnly`](BaseProperty.md#readonly)

***

### relation?

> `optional` **relation**: [`Relation`](Relation)

Defined in: [types/src/types/properties.ts:470](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

The resolved relation object.
This is set by the framework

***

### relationName

> **relationName**: `string`

Defined in: [types/src/types/properties.ts:464](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

The name of the relation this property refers to. This name must match
one of the `relationName`s defined in the top-level `relations` array
of the collection.

***

### type

> **type**: `"relation"`

Defined in: [types/src/types/properties.ts:451](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

***

### validation?

> `optional` **validation**: [`PropertyValidationSchema`](PropertyValidationSchema)

Defined in: [types/src/types/properties.ts:153](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Rules for validating this property

#### Inherited from

[`BaseProperty`](BaseProperty).[`validation`](BaseProperty.md#validation)

***

### widget?

> `optional` **widget**: `"dialog"` \| `"select"`

Defined in: [types/src/types/properties.ts:495](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

Choose the widget to use for selecting the relation.
Defaults to `select`.

***

### widthPercentage?

> `optional` **widthPercentage**: `number`

Defined in: [types/src/types/properties.ts:164](https://github.com/rebaseco/rebase/blob/main/packages/types/src/types/properties.ts)

A number between 0 and 100 that indicates the width of the field in the form view.
It defaults to 100, but you can set it to 50 to have two fields in the same row.

#### Inherited from

[`BaseProperty`](BaseProperty).[`widthPercentage`](BaseProperty.md#widthpercentage)
