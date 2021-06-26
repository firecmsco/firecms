---
id: "propertybuilder"
title: "Type alias: PropertyBuilder<T, S, Key>"
sidebar_label: "PropertyBuilder"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **PropertyBuilder**<T, S, Key\>: (`props`: [PropertyBuilderProps](propertybuilderprops.md)<S, Key\>) => [Property](property.md)<T\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T`: [CMSType](cmstype.md) = [CMSType](cmstype.md) |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key\> = [EntitySchema](../interfaces/entityschema.md)<any\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Type declaration

▸ (`props`): [Property](property.md)<T\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | [PropertyBuilderProps](propertybuilderprops.md)<S, Key\> |

##### Returns

[Property](property.md)<T\>

#### Defined in

[models/properties.ts:152](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L152)
