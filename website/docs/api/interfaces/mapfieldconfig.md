---
id: "mapfieldconfig"
title: "Interface: MapFieldConfig<T>"
sidebar_label: "MapFieldConfig"
sidebar_position: 0
custom_edit_url: null
---

Possible configuration fields for a string property. Note that setting one
config disables the others.

## Type parameters

| Name |
| :------ |
| `T` |

## Hierarchy

- [FieldConfig](fieldconfig.md)<T\>

  ↳ **MapFieldConfig**

## Properties

### clearMissingValues

• `Optional` **clearMissingValues**: `boolean`

Set this flag to true if you would like to remove values that are not
present in the saved value but are mapped in the schema.
This is useful if you are creating a custom field and need to have only
some specific properties. If set to false, when saving a new map value,
fields that exist in Firestore but not in the new value are not deleted.
Defaults to false.

#### Defined in

[models/models.ts:971](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L971)

___

### customProps

• `Optional` **customProps**: `any`

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Inherited from

[FieldConfig](fieldconfig.md).[customProps](fieldconfig.md#customprops)

#### Defined in

[models/models.ts:821](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L821)

___

### field

• `Optional` **field**: `ComponentType`<[FieldProps](fieldprops.md)<T, any, [EntitySchema](entityschema.md)<any, any\>, any\>\>

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

### pickOnlySomeKeys

• `Optional` **pickOnlySomeKeys**: `boolean`

Allow the user to add only some of the keys in this map.
By default all properties of the map have the corresponding field in
the form view. Setting this flag to true allows to pick only some.
Useful for map that can have a lot of subproperties that may not be
needed

#### Defined in

[models/models.ts:961](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L961)

___

### preview

• `Optional` **preview**: `ComponentType`<[PreviewComponentProps](previewcomponentprops.md)<T, any\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Inherited from

[FieldConfig](fieldconfig.md).[preview](fieldconfig.md#preview)

#### Defined in

[models/models.ts:815](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L815)
