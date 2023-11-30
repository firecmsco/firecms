---
id: "BlockFieldBinding"
title: "Function: BlockFieldBinding"
sidebar_label: "BlockFieldBinding"
sidebar_position: 0
custom_edit_url: null
---

▸ **BlockFieldBinding**\<`T`\>(`«destructured»`): `Element`

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
| `«destructured»` | [`FieldProps`](../interfaces/FieldProps.md)\<`T`, `any`, `any`\> |

#### Returns

`Element`

#### Defined in

[packages/firecms_core/src/form/field_bindings/BlockFieldBinding.tsx:23](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/field_bindings/BlockFieldBinding.tsx#L23)
