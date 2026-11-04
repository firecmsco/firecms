---
slug: "docs/api/interfaces/ReferenceProperty"
title: "ReferenceProperty"
---

[**@firecms/core**](/docs/api/README)

***

[@firecms/core](/docs/api/README) / ReferenceProperty

# Interface: ReferenceProperty

Defined in: [types/properties.ts:639](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

## Extends

- [`BaseProperty`](/docs/api/interfaces/BaseProperty)\<[`EntityReference`](/docs/api/classes/EntityReference)\>

## Properties

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

> **dataType**: `"reference"`

Defined in: [types/properties.ts:641](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Datatype of the property

#### Overrides

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`dataType`](/docs/api/interfaces/BaseProperty#datatype)

***

### defaultValue?

> `optional` **defaultValue**: [`EntityReference`](/docs/api/classes/EntityReference) \| `null`

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

### Field?

> `optional` **Field**: `ComponentType`\<[`FieldProps`](/docs/api/interfaces/FieldProps)\<[`EntityReference`](/docs/api/classes/EntityReference), `any`, `any`\>\>

Defined in: [types/properties.ts:135](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`Field`](/docs/api/interfaces/BaseProperty#field)

***

### forceFilter?

> `optional` **forceFilter**: `Partial`\<`Record`\<`string`, \[[`WhereFilterOp`](/docs/api/type-aliases/WhereFilterOp), `any`\]\>\>

Defined in: [types/properties.ts:659](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Allow selection of entities that pass the given filter only.
e.g. `forceFilter: { age: [">=", 18] }`

***

### hideFromCollection?

> `optional` **hideFromCollection**: `boolean`

Defined in: [types/properties.ts:106](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Do not show this property in the collection view

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`hideFromCollection`](/docs/api/interfaces/BaseProperty#hidefromcollection)

***

### includeEntityLink?

> `optional` **includeEntityLink**: `boolean`

Defined in: [types/properties.ts:676](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Should the reference include a link to the entity (open the entity details). Defaults to `true`

***

### includeId?

> `optional` **includeId**: `boolean`

Defined in: [types/properties.ts:671](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Should the reference include the ID of the entity. Defaults to `true`

***

### longDescription?

> `optional` **longDescription**: `string`

Defined in: [types/properties.ts:95](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Longer description of a field, displayed under a popover

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`longDescription`](/docs/api/interfaces/BaseProperty#longdescription)

***

### name?

> `optional` **name**: `string`

Defined in: [types/properties.ts:77](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Property name (e.g. Product)

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`name`](/docs/api/interfaces/BaseProperty#name)

***

### path?

> `optional` **path**: `string`

Defined in: [types/properties.ts:653](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Absolute collection path of the collection this reference points to.
The collection of the entity is inferred based on the root navigation, so
the filters and search delegate existing there are applied to this view
as well.
You can leave this prop undefined if the path is not yet know, e.g.
you are using a property builder and the path depends on a different
property.
Note that you can also use a collection id.

***

### Preview?

> `optional` **Preview**: `ComponentType`\<[`PropertyPreviewProps`](/docs/api/interfaces/PropertyPreviewProps)\<[`EntityReference`](/docs/api/classes/EntityReference), `any`\>\>

Defined in: [types/properties.ts:142](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`Preview`](/docs/api/interfaces/BaseProperty#preview)

***

### previewProperties?

> `optional` **previewProperties**: `string`[]

Defined in: [types/properties.ts:666](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Properties that need to be rendered when displaying a preview of this
reference. If not specified the first 3 are used. Only the first 3
specified values are considered.

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

### validation?

> `optional` **validation**: [`PropertyValidationSchema`](/docs/api/interfaces/PropertyValidationSchema)

Defined in: [types/properties.ts:126](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

Rules for validating this property

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`validation`](/docs/api/interfaces/BaseProperty#validation)

***

### widthPercentage?

> `optional` **widthPercentage**: `number`

Defined in: [types/properties.ts:165](https://github.com/firecmsco/firecms/blob/main/packages/firecms_core/src/types/properties.ts)

A number between 0 and 100 that indicates the width of the field in the form view.
It defaults to 100, but you can set it to 50 to have two fields in the same row.

#### Inherited from

[`BaseProperty`](/docs/api/interfaces/BaseProperty).[`widthPercentage`](/docs/api/interfaces/BaseProperty#widthpercentage)
