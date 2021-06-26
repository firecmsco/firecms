---
id: "filtervalues"
title: "Type alias: FilterValues<S, Key>"
sidebar_label: "FilterValues"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **FilterValues**<S, Key\>: `Partial`<{ [K in Key]: [WhereFilterOp, any]}\>

Used to define filters applied in collections

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Defined in

[models/collections.ts:212](https://github.com/Camberi/firecms/blob/b1328ad/src/models/collections.ts#L212)
