---
id: "saveEntityWithCallbacks"
title: "Function: saveEntityWithCallbacks"
sidebar_label: "saveEntityWithCallbacks"
sidebar_position: 0
custom_edit_url: null
---

▸ **saveEntityWithCallbacks**<`M`, `UserType`\>(`__namedParameters`): `Promise`<`void`\>

This function is in charge of saving an entity to the datasource.
It will run all the save callbacks specified in the schema.
It is also possible to attach callbacks on save success or error, and callback
errors.

If you just want to save the data without running the `onSaveSuccess`,
`onSaveFailure` and `onPreSave` callbacks, you can use the `saveEntity` method
in the datasource ([useDataSource](useDataSource)).

**`see`** useDataSource

#### Type parameters

| Name |
| :------ |
| `M` |
| `UserType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`SaveEntityProps`](../interfaces/SaveEntityProps)<`M`\> & { `callbacks?`: [`EntityCallbacks`](../interfaces/EntityCallbacks)<`M`\> ; `onPreSaveHookError?`: (`e`: `Error`) => `void` ; `onSaveFailure?`: (`e`: `Error`) => `void` ; `onSaveSuccess?`: (`updatedEntity`: [`Entity`](../interfaces/Entity)<`M`\>) => `void` ; `onSaveSuccessHookError?`: (`e`: `Error`) => `void`  } & { `context`: [`FireCMSContext`](../interfaces/FireCMSContext)<`UserType`\> ; `dataSource`: [`DataSource`](../interfaces/DataSource)  } |

#### Returns

`Promise`<`void`\>

#### Defined in

[hooks/data/save.ts:51](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/save.ts#L51)
