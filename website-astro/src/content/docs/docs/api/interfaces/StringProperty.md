---
slug: "docs/api/interfaces/StringProperty"
title: "StringProperty"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / StringProperty

# Interface: StringProperty

Defined in: [types/properties.ts:355](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Extends

- [`BaseProperty`](/docs/api/interfaces/BaseProperty)\<`string`\>

## Properties

### clearable?

> `optional` **clearable**: `boolean`

Defined in: [types/properties.ts:425](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Add an icon to clear the value and set it to `null`. Defaults to `false`

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

> **dataType**: `"string"`

Defined in: [types/properties.ts:357](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Datatype of the property

#### Overrides

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`dataType`](/docs/api/interfaces/BaseProperty#datatype)

***

### defaultValue?

> `optional` **defaultValue**: `string` \| `null`

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

### email?

> `optional` **email**: `boolean`

Defined in: [types/properties.ts:410](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Does this field include an email

***

### enumValues?

> `optional` **enumValues**: [`EnumValues`](/docs/api/type-aliases/EnumValues)

Defined in: [types/properties.ts:383](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

You can use the enum values providing a map of possible
exclusive values the property can take, mapped to the label that it is
displayed in the dropdown. You can use a simple object with the format
`value` => `label`, or with the format `value` => `EnumValueConfig` if you
need extra customization, (like disabling specific options or assigning
colors). If you need to ensure the order of the elements, you can pass
a `Map` instead of a plain object.

***

### Field?

> `optional` **Field**: `ComponentType`\<[`FieldProps`](/docs/api/interfaces/FieldProps)\<`string`, `any`, `any`\>\>

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

### markdown?

> `optional` **markdown**: `boolean`

Defined in: [types/properties.ts:371](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Should this string property be displayed as a markdown field. If true,
the field is rendered as a text editors that supports markdown highlight
syntax. It also includes a preview of the result.

***

### multiline?

> `optional` **multiline**: `boolean`

Defined in: [types/properties.ts:364](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Is this string property long enough so it should be displayed in
a multiple line field. Defaults to false. If set to true,
the number of lines adapts to the content

***

### name?

> `optional` **name**: `string`

Defined in: [types/properties.ts:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property name (e.g. Product)

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`name`](/docs/api/interfaces/BaseProperty#name)

***

### Preview?

> `optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](/docs/api/interfaces/PropertyPreviewProps)\<`string`, `any`\>\>

Defined in: [types/properties.ts:142](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`Preview`](/docs/api/interfaces/BaseProperty#preview)

***

### previewAsTag?

> `optional` **previewAsTag**: `boolean`

Defined in: [types/properties.ts:415](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Should this string be rendered as a tag instead of just text.

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

### reference?

> `optional` **reference**: [`ReferenceProperty`](/docs/api/interfaces/ReferenceProperty)

Defined in: [types/properties.ts:433](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

You can use this property (a string) to behave as a reference to another
collection. The stored value is the ID of the entity in the
collection, and the `path` prop is used to
define the collection this reference points to.

***

### storage?

> `optional` **storage**: [`StorageConfig`](/docs/api/type-aliases/StorageConfig)

Defined in: [types/properties.ts:389](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

You can specify a `Storage` configuration. It is used to
indicate that this string refers to a path in your storage provider.

***

### url?

> `optional` **url**: `boolean` \| [`PreviewType`](/docs/api/type-aliases/PreviewType)

Defined in: [types/properties.ts:405](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If the value of this property is a URL, you can set this flag to true
to add a link, or one of the supported media types to render a preview

***

### userSelect?

> `optional` **userSelect**: `boolean`

Defined in: [types/properties.ts:399](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

This property is used to indicate that the string is a user ID, and
it will be rendered as a user picker.
Note that the user ID needs to be the one used in your authentication
provider, e.g. Firebase Auth.
You can also use a property builder to specify the user path dynamically
based on other values of the entity.

***

### validation?

> `optional` **validation**: [`StringPropertyValidationSchema`](/docs/api/interfaces/StringPropertyValidationSchema)

Defined in: [types/properties.ts:420](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

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
