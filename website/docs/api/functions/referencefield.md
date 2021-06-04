---
id: "referencefield"
title: "Function: ReferenceField"
sidebar_label: "ReferenceField"
sidebar_position: 0
custom_edit_url: null
---

▸ **ReferenceField**<S, Key\>(`__namedParameters`): `Element`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, any, S\> = [EntitySchema](../interfaces/entityschema.md)<any, any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [FieldProps](../interfaces/fieldprops.md)<firebase.firestore.DocumentReference\> |

#### Returns

`Element`

#### Defined in

[form/fields/ReferenceField.tsx:61](https://github.com/Camberi/firecms/blob/42dd384/src/form/fields/ReferenceField.tsx#L61)
