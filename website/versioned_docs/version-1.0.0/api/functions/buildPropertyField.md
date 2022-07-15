---
id: "buildPropertyField"
title: "Function: buildPropertyField"
sidebar_label: "buildPropertyField"
sidebar_position: 0
custom_edit_url: null
---

▸ **buildPropertyField**<`T`, `M`\>(`__namedParameters`): `ReactElement`<[`CMSFormFieldProps`](../interfaces/CMSFormFieldProps)<`M`\>\>

This factory method renders a form field creating the corresponding configuration
from a property. For example if bound to a string property, it will generate
a text field.

You can use it when you are creating a custom field, and need to
render additional fields mapped to properties. This is useful if you
need to build a complex property mapping, like an array where each index
is a different property.

Please note that if you build a custom field in a component, the
**validation** passed in the property will have no effect. You need to set
the validation in the `EntitySchema` definition.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType) = `any` |
| `M` | `any` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`CMSFormFieldProps`](../interfaces/CMSFormFieldProps)<`M`\> |

#### Returns

`ReactElement`<[`CMSFormFieldProps`](../interfaces/CMSFormFieldProps)<`M`\>\>

#### Defined in

[form/form_factory.tsx:63](https://github.com/Camberi/firecms/blob/2d60fba/src/form/form_factory.tsx#L63)
