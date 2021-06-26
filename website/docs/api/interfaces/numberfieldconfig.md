---
id: "numberfieldconfig"
title: "Interface: NumberFieldConfig"
sidebar_label: "NumberFieldConfig"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [FieldConfig](fieldconfig.md)<number\>

  ↳ **NumberFieldConfig**

## Properties

### customProps

• `Optional` **customProps**: `any`

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Inherited from

[FieldConfig](fieldconfig.md).[customProps](fieldconfig.md#customprops)

#### Defined in

[models/properties.ts:418](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L418)

___

### enumValues

• `Optional` **enumValues**: [EnumValues](../types/enumvalues.md)

You can use the enum values providing a map of possible
exclusive values the property can take, mapped to the label that it is
displayed in the dropdown.

#### Defined in

[models/properties.ts:591](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L591)

___

### field

• `Optional` **field**: `ElementType`<[FieldProps](fieldprops.md)<number, any, [EntitySchema](entityschema.md)<any\>, any\>\>

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Inherited from

[FieldConfig](fieldconfig.md).[field](fieldconfig.md#field)

#### Defined in

[models/properties.ts:405](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L405)

___

### preview

• `Optional` **preview**: `ElementType`<[PreviewComponentProps](previewcomponentprops.md)<number, any\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[FieldConfig](fieldconfig.md).[preview](fieldconfig.md#preview)

#### Defined in

[models/properties.ts:412](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L412)
