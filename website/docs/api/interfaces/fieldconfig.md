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
| `T` | `T` |
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

[models/models.ts:821](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L821)

___

### field

• `Optional` **field**: `ComponentType`<[FieldProps](fieldprops.md)<T, CustomProps, [EntitySchema](entityschema.md)<any, any\>, any\>\>

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Defined in

[models/models.ts:808](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L808)

___

### preview

• `Optional` **preview**: `ComponentType`<[PreviewComponentProps](previewcomponentprops.md)<T, CustomProps\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Defined in

[models/models.ts:815](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L815)
