---
id: "propertybuilder"
title: "Type alias: PropertyBuilder<S, Key, T>"
sidebar_label: "PropertyBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertyBuilder**<S, Key, T\>: (`props`: [PropertyBuilderProps](propertybuilderprops.md)<S, Key\>) => [Property](property.md)<T\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |
| `T` | `T`: `any` = `any` |

#### Type declaration

▸ (`props`): [Property](property.md)<T\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [PropertyBuilderProps](propertybuilderprops.md)<S, Key\> |

##### Returns

[Property](property.md)<T\>

#### Defined in

[models/models.ts:523](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L523)
