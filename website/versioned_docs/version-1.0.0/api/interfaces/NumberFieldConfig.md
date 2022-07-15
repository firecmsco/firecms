---
id: "NumberFieldConfig"
title: "Interface: NumberFieldConfig"
sidebar_label: "NumberFieldConfig"
sidebar_position: 0
custom_edit_url: null
---

## Hierarchy

- [`FieldConfig`](FieldConfig)<`number`\>

  ↳ **`NumberFieldConfig`**

## Properties

### Field

• `Optional` **Field**: `ComponentType`<[`FieldProps`](FieldProps)<`number`, `any`, `any`\>\>

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

• `Optional` **Preview**: `ComponentType`<[`PreviewComponentProps`](PreviewComponentProps)<`number`, `any`\>\>

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
displayed in the dropdown.

#### Defined in

[models/properties.ts:724](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L724)
