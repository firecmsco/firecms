---
id: "stringfieldconfig"
title: "Interface: StringFieldConfig"
sidebar_label: "StringFieldConfig"
sidebar_position: 0
custom_edit_url: null
---

Possible configuration fields for a string property. Note that setting one
config disables the others.

## Hierarchy

- [FieldConfig](fieldconfig.md)<string\>

  ↳ **StringFieldConfig**

## Properties

### customProps

• `Optional` **customProps**: `any`

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Inherited from

[FieldConfig](fieldconfig.md).[customProps](fieldconfig.md#customprops)

#### Defined in

[models/models.ts:821](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L821)

___

### enumValues

• `Optional` **enumValues**: [EnumValues](../types/enumvalues.md)

You can use the enum values providing a map of possible
exclusive values the property can take, mapped to the label that it is
displayed in the dropdown. You can use a simple object with the format
`value` => `label`, or with the format `value` => `EnumValueConfig` if you
need extra customization, (like disabling specific options or assigning
colors). If you need to ensure the order of the elements, you can pass
a `Map` instead of a plain object.

#### Defined in

[models/models.ts:853](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L853)

___

### field

• `Optional` **field**: `ComponentType`<[FieldProps](fieldprops.md)<string, any, [EntitySchema](entityschema.md)<any, any\>, any\>\>

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Inherited from

[FieldConfig](fieldconfig.md).[field](fieldconfig.md#field)

#### Defined in

[models/models.ts:808](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L808)

___

### markdown

• `Optional` **markdown**: `boolean`

Should this string property be displayed as a markdown field. If true,
the field is rendered as a text editors that supports markdown highlight
syntax. It also includes a preview of the result.

#### Defined in

[models/models.ts:842](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L842)

___

### multiline

• `Optional` **multiline**: `boolean`

Is this string property long enough so it should be displayed in
a multiple line field. Defaults to false. If set to true,
the number of lines adapts to the content

#### Defined in

[models/models.ts:835](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L835)

___

### preview

• `Optional` **preview**: `ComponentType`<[PreviewComponentProps](previewcomponentprops.md)<string, any\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[FieldConfig](fieldconfig.md).[preview](fieldconfig.md#preview)

#### Defined in

[models/models.ts:815](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L815)

___

### previewAsTag

• `Optional` **previewAsTag**: `boolean`

Should this string be rendered as a tag instead of just text.

#### Defined in

[models/models.ts:870](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L870)

___

### storageMeta

• `Optional` **storageMeta**: [StorageMeta](storagemeta.md)

You can specify a `StorageMeta` configuration. It is used to
indicate that this string refers to a path in Google Cloud Storage.

#### Defined in

[models/models.ts:859](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L859)

___

### url

• `Optional` **url**: `boolean` \| [MediaType](../types/mediatype.md)

If the value of this property is a URL, you can set this flag to true
to add a link, or one of the supported media types to render a preview

#### Defined in

[models/models.ts:865](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L865)
