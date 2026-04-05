---
slug: "docs/api/interfaces/StringProperty"
title: "StringProperty"
---

[**@rebasepro/core**](../README)

***

[@rebasepro/core](../README) / StringProperty

# Interface: StringProperty

Defined in: [types/src/types/properties.ts:218](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

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

Defined in: [types/src/types/properties.ts:298](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Add an icon to clear the value and set it to `null`. Defaults to `false`

***

### columnType?

> `optional` **columnType**: `"text"` \| `"char"` \| `"varchar"`

Defined in: [types/src/types/properties.ts:224](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Optional database column type. If not set, it defaults to `varchar` or `uuid` depending on `isId` configuration.
Use `text` for strings with unbound length, `char` for fixed-length strings, or `varchar` for variable-length strings with a limit.

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

### email?

> `optional` **email**: `boolean`

Defined in: [types/src/types/properties.ts:290](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Does this field include an email

***

### enum?

> `optional` **enum**: [`EnumValues`](../type-aliases/EnumValues)

Defined in: [types/src/types/properties.ts:253](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

You can use the enum values providing a map of possible
exclusive values the property can take, mapped to the label that it is
displayed in the dropdown. You can use a simple object with the format
`value` => `label`, or with the format `value` => `EnumValueConfig` if you
need extra customization, (like disabling specific options or assigning
colors). If you need to ensure the order of the elements, you can pass
a `Map` instead of a plain object.

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

Defined in: [types/src/types/properties.ts:242](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Marks this field as a Primary Key / Unique Identifier.
Framework behavior: Auto-maps to `collection.primaryKeys` internally if not explicitly set.
Drizzle append: `.primaryKey()`
UI behavior: Field value cannot be changed after creation.

You can set this to `"manual"` for a user-defined ID, or specify a generation strategy:
'uuid' -> Drizzle `.defaultRandom()` (Postgres gen_random_uuid())
'cuid' -> Drizzle `.default(sql\`cuid()\`)`
Or any other random string to act as a raw SQL default expression: e.g. `nanoid()`

On the UI side, the field automatically gets disabled on new entities if a string strategy is provided.

***

### markdown?

> `optional` **markdown**: `boolean`

Defined in: [types/src/types/properties.ts:265](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Should this string property be displayed as a markdown field. If true,
the field is rendered as a text editors that supports markdown highlight
syntax. It also includes a preview of the result.

***

### multiline?

> `optional` **multiline**: `boolean`

Defined in: [types/src/types/properties.ts:259](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Is this string property long enough so it should be displayed in
a multiple line field. Defaults to false. If set to true,
the number of lines adapts to the content

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

### previewAsTag?

> `optional` **previewAsTag**: `boolean`

Defined in: [types/src/types/properties.ts:294](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

Should this string be rendered as a tag instead of just text.

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

### reference?

> `optional` **reference**: [`ReferenceProperty`](ReferenceProperty)

Defined in: [types/src/types/properties.ts:306](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

You can use this property (a string) to behave as a reference to another
collection. The stored value is the ID of the entity in the
collection, and the `path` prop is used to
define the collection this reference points to.

***

### storage?

> `optional` **storage**: [`StorageConfig`](../type-aliases/StorageConfig)

Defined in: [types/src/types/properties.ts:270](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

You can specify a `Storage` configuration. It is used to
indicate that this string refers to a path in your storage provider.

***

### type

> **type**: `"string"`

Defined in: [types/src/types/properties.ts:219](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

***

### url?

> `optional` **url**: `boolean` \| [`PreviewType`](../type-aliases/PreviewType)

Defined in: [types/src/types/properties.ts:286](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

If the value of this property is a URL, you can set this flag to true
to add a link, or one of the supported media types to render a preview

***

### userSelect?

> `optional` **userSelect**: `boolean`

Defined in: [types/src/types/properties.ts:280](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

This property is used to indicate that the string is a user ID, and
it will be rendered as a user picker.
Note that the user ID needs to be the one used in your authentication
provider, e.g. Firebase Auth.
You can also use a property builder to specify the user path dynamically
based on other values of the entity.

***

### validation?

> `optional` **validation**: [`StringPropertyValidationSchema`](StringPropertyValidationSchema)

Defined in: [types/src/types/properties.ts:228](https://github.com/rebasepro/rebase/blob/main/packages/types/src/types/properties.ts)

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
