---
id: "entitypreview"
title: "Function: EntityPreview"
sidebar_label: "EntityPreview"
sidebar_position: 0
custom_edit_url: null
---

▸ **EntityPreview**<S, Key\>(`__namedParameters`): `Element`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, any, S\> = [EntitySchema](../interfaces/entityschema.md)<any, any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `EntityPreviewProps`<S, Key\> |

#### Returns

`Element`

#### Defined in

[components/EntityPreview.tsx:50](https://github.com/Camberi/firecms/blob/42dd384/src/components/EntityPreview.tsx#L50)
