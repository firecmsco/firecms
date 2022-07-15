---
id: "StringFieldConfig"
title: "Interface: StringFieldConfig"
sidebar_label: "StringFieldConfig"
sidebar_position: 0
custom_edit_url: null
---

Possible configuration fields for a string property. Note that setting one
config disables the others.

## Hierarchy

- [`FieldConfig`](FieldConfig)<`string`\>

  ↳ **`StringFieldConfig`**

## Properties

### Field

• `Optional` **Field**: `ComponentType`<[`FieldProps`](FieldProps)<`string`, `any`, `any`\>\>

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Inherited from

[FieldConfig](FieldConfig).[Field](FieldConfig#field)

#### Defined in

[models/properties.ts:531](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L531)

___

### Preview

• `Optional` **Preview**: `ComponentType`<[`PreviewComponentProps`](PreviewComponentProps)<`string`, `any`\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[FieldConfig](FieldConfig).[Preview](FieldConfig#preview)

#### Defined in

[models/properties.ts:538](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L538)

___

### customProps

• `Optional` **customProps**: `any`

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Inherited from

[FieldConfig](FieldConfig).[customProps](FieldConfig#customprops)

#### Defined in

[models/properties.ts:544](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L544)

___

### enumValues

• `Optional` **enumValues**: [`EnumValues`](../types/EnumValues)

You can use the enum values providing a map of possible
exclusive values the property can take, mapped to the label that it is
displayed in the dropdown. You can use a simple object with the format
`value` => `label`, or with the format `value` => `EnumValueConfig` if you
need extra customization, (like disabling specific options or assigning
colors). If you need to ensure the order of the elements, you can pass
a `Map` instead of a plain object.

#### Defined in

[models/properties.ts:577](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L577)

___

### markdown

• `Optional` **markdown**: `boolean`

Should this string property be displayed as a markdown field. If true,
the field is rendered as a text editors that supports markdown highlight
syntax. It also includes a preview of the result.

#### Defined in

[models/properties.ts:566](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L566)

___

### multiline

• `Optional` **multiline**: `boolean`

Is this string property long enough so it should be displayed in
a multiple line field. Defaults to false. If set to true,
the number of lines adapts to the content

#### Defined in

[models/properties.ts:559](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L559)

___

### previewAsTag

• `Optional` **previewAsTag**: `boolean`

Should this string be rendered as a tag instead of just text.

#### Defined in

[models/properties.ts:594](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L594)

___

### storageMeta

• `Optional` **storageMeta**: [`StorageMeta`](StorageMeta)

You can specify a `StorageMeta` configuration. It is used to
indicate that this string refers to a path in Google Cloud Storage.

#### Defined in

[models/properties.ts:583](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L583)

___

### url

• `Optional` **url**: `boolean` \| [`MediaType`](../types/MediaType)

If the value of this property is a URL, you can set this flag to true
to add a link, or one of the supported media types to render a preview

#### Defined in

[models/properties.ts:589](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L589)
