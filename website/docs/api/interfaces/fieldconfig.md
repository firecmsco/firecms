---
id: "fieldconfig"
title: "Interface: FieldConfig<T, CustomProps>"
sidebar_label: "FieldConfig"
sidebar_position: 0
custom_edit_url: null
---

Configure how a field is displayed

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [CMSType](../types/cmstype.md) |
| `CustomProps` | `CustomProps` = `any` |

## Hierarchy

- **FieldConfig**

  ↳ [StringFieldConfig](stringfieldconfig.md)

  ↳ [MapFieldConfig](mapfieldconfig.md)

  ↳ [NumberFieldConfig](numberfieldconfig.md)

## Properties

### customProps

• `Optional` **customProps**: `CustomProps`

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Defined in

[models/properties.ts:418](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L418)

___

### field

• `Optional` **field**: `ElementType`<[FieldProps](fieldprops.md)<T, CustomProps, [EntitySchema](entityschema.md)<any\>, any\>\>

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Defined in

[models/properties.ts:405](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L405)

___

### preview

• `Optional` **preview**: `ElementType`<[PreviewComponentProps](previewcomponentprops.md)<T, CustomProps\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Defined in

[models/properties.ts:412](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L412)
