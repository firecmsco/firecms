---
id: "entityvalues"
title: "Type alias: EntityValues<S, Key>"
sidebar_label: "EntityValues"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntityValues**<S, Key\>: { [K in Key]: S["properties"][K] extends Property<infer T\> ? T : S["properties"][K] extends PropertyBuilder<S, Key, infer T\> ? T : any}

This type represents a record of key value pairs as described in an
entity schema.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Defined in

[models/models.ts:536](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L536)
