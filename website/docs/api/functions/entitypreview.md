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
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, S\> = [EntitySchema](../interfaces/entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `EntityPreviewProps`<S, Key\> |

#### Returns

`Element`

#### Defined in

[core/components/EntityPreview.tsx:55](https://github.com/Camberi/firecms/blob/b1328ad/src/core/components/EntityPreview.tsx#L55)
