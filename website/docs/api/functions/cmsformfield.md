---
id: "cmsformfield"
title: "Function: CMSFormField"
sidebar_label: "CMSFormField"
sidebar_position: 0
custom_edit_url: null
---

▸ **CMSFormField**<T, S, Key\>(`__namedParameters`): `JSX.Element`

This component renders a form field creating the corresponding configuration
from a property. For example if bound to a string property, it will generate
a text field.

You can use it when you are creating a custom field, and need to
render additional fields mapped to properties. This is useful if you
need to build a complex property mapping, like an array where each index
is a different property.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, any, S\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [CMSFormFieldProps](../interfaces/cmsformfieldprops.md)<S, Key\> |

#### Returns

`JSX.Element`

#### Defined in

[form/form_factory.tsx:72](https://github.com/Camberi/firecms/blob/42dd384/src/form/form_factory.tsx#L72)
