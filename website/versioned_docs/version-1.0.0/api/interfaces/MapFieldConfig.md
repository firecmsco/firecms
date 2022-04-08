---
id: "MapFieldConfig"
title: "Interface: MapFieldConfig<T>"
sidebar_label: "MapFieldConfig"
sidebar_position: 0
custom_edit_url: null
---

Possible configuration fields for a string property. Note that setting one
config disables the others.

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

## Hierarchy

- [`FieldConfig`](FieldConfig)<`T`\>

  ↳ **`MapFieldConfig`**

## Properties

### Field

• `Optional` **Field**: `ComponentType`<[`FieldProps`](FieldProps)<`T`, `any`, `any`\>\>

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

• `Optional` **Preview**: `ComponentType`<[`PreviewComponentProps`](PreviewComponentProps)<`T`, `any`\>\>

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

### pickOnlySomeKeys

• `Optional` **pickOnlySomeKeys**: `boolean`

Allow the user to add only some of the keys in this map.
By default all properties of the map have the corresponding field in
the form view. Setting this flag to true allows to pick only some.
Useful for map that can have a lot of subproperties that may not be
needed

#### Defined in

[models/properties.ts:696](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L696)
