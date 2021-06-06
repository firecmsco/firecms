---
id: "saveentity"
title: "Function: saveEntity"
sidebar_label: "saveEntity"
sidebar_position: 0
custom_edit_url: null
---

▸ **saveEntity**<S, Key\>(`__namedParameters`): `Promise`<void\>

Save entity to the specified path. Note that Firestore does not allow
undefined values.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `S` | `S`: [EntitySchema](../interfaces/entityschema.md)<Key, any, S\> |
| `Key` | `Key`: `string` = `Extract`<keyof `S`[``"properties"``], string\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.collectionPath` | `string` |
| `__namedParameters.context` | `CMSAppContext` |
| `__namedParameters.id` | `string` \| `undefined` |
| `__namedParameters.onPreSaveHookError?` | (`e`: `Error`) => `void` |
| `__namedParameters.onSaveFailure?` | (`e`: `Error`) => `void` |
| `__namedParameters.onSaveSuccess?` | (`entity`: [Entity](../interfaces/entity.md)<S, Key\>) => `void` |
| `__namedParameters.onSaveSuccessHookError?` | (`e`: `Error`) => `void` |
| `__namedParameters.schema` | `S` |
| `__namedParameters.status` | [EntityStatus](../types/entitystatus.md) |
| `__namedParameters.values` | `Partial`<[EntityValues](../types/entityvalues.md)<S, Key\>\> |

#### Returns

`Promise`<void\>

#### Defined in

[models/firestore.ts:233](https://github.com/Camberi/firecms/blob/42dd384/src/models/firestore.ts#L233)
