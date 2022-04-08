---
id: "ExportMappingFunction"
title: "Interface: ExportMappingFunction<UserType>"
sidebar_label: "ExportMappingFunction"
sidebar_position: 0
custom_edit_url: null
---

## Type parameters

| Name | Type |
| :------ | :------ |
| `UserType` | extends [`User`](../types/User) = [`User`](../types/User) |

## Properties

### key

• **key**: `string`

#### Defined in

[models/collections.ts:297](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L297)

## Methods

### builder

▸ **builder**(`__namedParameters`): `string` \| `Promise`<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.context` | [`FireCMSContext`](FireCMSContext)<`UserType`\> |
| `__namedParameters.entity` | [`Entity`](Entity)<`any`\> |

#### Returns

`string` \| `Promise`<`string`\>

#### Defined in

[models/collections.ts:298](https://github.com/Camberi/firecms/blob/2d60fba/src/models/collections.ts#L298)
