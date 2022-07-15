---
id: "FieldConfig"
title: "Interface: FieldConfig<T, CustomProps>"
sidebar_label: "FieldConfig"
sidebar_position: 0
custom_edit_url: null
---

Configure how a field is displayed

## Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType) |
| `CustomProps` | `any` |

## Hierarchy

- **`FieldConfig`**

  ↳ [`StringFieldConfig`](StringFieldConfig)

  ↳ [`MapFieldConfig`](MapFieldConfig)

  ↳ [`NumberFieldConfig`](NumberFieldConfig)

## Properties

### Field

• `Optional` **Field**: `ComponentType`<[`FieldProps`](FieldProps)<`T`, `CustomProps`, `any`\>\>

If you need to render a custom field, you can create a component that
takes `FieldProps` as props. You receive the value, a function to
update the value and additional utility props such as if there is an error.
You can customize it by passing custom props that are received
in the component.

#### Defined in

[models/properties.ts:531](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L531)

___

### Preview

• `Optional` **Preview**: `ComponentType`<[`PreviewComponentProps`](PreviewComponentProps)<`T`, `CustomProps`\>\>

Configure how a property is displayed as a preview, e.g. in the collection
view. You can customize it by passing custom props that are received
in the component.

#### Defined in

[models/properties.ts:538](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L538)

___

### customProps

• `Optional` **customProps**: `CustomProps`

Additional props that are passed to the components defined in `field`
or in `preview`.

#### Defined in

[models/properties.ts:544](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L544)
