---
id: "entityvalues"
title: "Type alias: EntityValues<S, Key>"
sidebar_label: "EntityValues"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **EntityValues**<S, Key\>: { [K in Key]: S["properties"][K] extends Property<infer T\> ? T : S["properties"][K] extends PropertyBuilder<infer T, S, Key\> ? T : any}

This type represents a record of key value pairs as described in an
entity schema.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Defined in

[models/models.ts:173](https://github.com/Camberi/firecms/blob/b1328ad/src/models/models.ts#L173)
