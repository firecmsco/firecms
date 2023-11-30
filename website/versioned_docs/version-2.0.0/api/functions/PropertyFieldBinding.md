---
id: "PropertyFieldBinding"
title: "Function: PropertyFieldBinding"
sidebar_label: "PropertyFieldBinding"
sidebar_position: 0
custom_edit_url: null
---

▸ **PropertyFieldBinding**\<`T`, `CustomProps`, `M`\>(`«destructured»`): `ReactElement`\<[`PropertyFieldBindingProps`](../interfaces/PropertyFieldBindingProps.md)\<`T`, `M`\>\>

This component renders a form field creating the corresponding configuration
from a property. For example if bound to a string property, it will generate
a text field.

You can use it when you are creating a custom field, and need to
render additional fields mapped to properties. This is useful if you
need to build a complex property mapping, like an array where each index
is a different property.

Please note that if you build a custom field in a component, the
**validation** passed in the property will have no effect. You need to set
the validation in the `EntityCollection` definition.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`CMSType`](../types/CMSType.md) = [`CMSType`](../types/CMSType.md) |
| `CustomProps` | `any` |
| `M` | extends `Record`\<`string`, `any`\> = `Record`\<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`PropertyFieldBindingProps`](../interfaces/PropertyFieldBindingProps.md)\<`T`, `M`\> |

#### Returns

`ReactElement`\<[`PropertyFieldBindingProps`](../interfaces/PropertyFieldBindingProps.md)\<`T`, `M`\>\>

#### Defined in

[packages/firecms_core/src/form/PropertyFieldBinding.tsx:77](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/form/PropertyFieldBinding.tsx#L77)
