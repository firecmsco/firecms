---
id: "schemaresolver"
title: "Type alias: SchemaResolver"
sidebar_label: "SchemaResolver"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **SchemaResolver**: (`props`: { `collectionPath`: `string` ; `entityId?`: `string`  }) => [SchemaConfig](../interfaces/schemaconfig.md) \| `undefined`

Used to override schemas based on the collection path and entityId.
If no schema

#### Type declaration

▸ (`props`): [SchemaConfig](../interfaces/schemaconfig.md) \| `undefined`

##### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `props.collectionPath` | `string` |
| `props.entityId?` | `string` |

##### Returns

[SchemaConfig](../interfaces/schemaconfig.md) \| `undefined`

#### Defined in

[models/schema_resolver.ts:31](https://github.com/Camberi/firecms/blob/42dd384/src/models/schema_resolver.ts#L31)
