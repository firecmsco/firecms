---
id: "ArrayOneOfField"
title: "Function: ArrayOneOfField"
sidebar_label: "ArrayOneOfField"
sidebar_position: 0
custom_edit_url: null
---

▸ **ArrayOneOfField**<`T`\>(`__namedParameters`): `Element`

If the `oneOf` property is specified, this fields render each array entry as
a `type` select and the corresponding field widget to the selected `type.

This is one of the internal components that get mapped natively inside forms
and tables to the specified properties.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `any`[] |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`FieldProps`](../interfaces/FieldProps)<`T`, `any`, `any`\> |

#### Returns

`Element`

#### Defined in

[form/fields/ArrayOneOfField.tsx:29](https://github.com/Camberi/firecms/blob/2d60fba/src/form/fields/ArrayOneOfField.tsx#L29)
