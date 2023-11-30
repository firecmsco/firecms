---
id: "saveEntityWithCallbacks"
title: "Function: saveEntityWithCallbacks"
sidebar_label: "saveEntityWithCallbacks"
sidebar_position: 0
custom_edit_url: null
---

▸ **saveEntityWithCallbacks**\<`M`, `UserType`\>(`«destructured»`): `Promise`\<`void`\>

This function is in charge of saving an entity to the datasource.
It will run all the save callbacks specified in the collection.
It is also possible to attach callbacks on save success or error, and callback
errors.

If you just want to save the data without running the `onSaveSuccess`,
`onSaveFailure` and `onPreSave` callbacks, you can use the `saveEntity` method
in the datasource ([useDataSource](useDataSource.md)).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |
| `UserType` | extends [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`SaveEntityProps`](../interfaces/SaveEntityProps.md)\<`M`\> & \{ `callbacks?`: [`EntityCallbacks`](../interfaces/EntityCallbacks.md)\<`M`, [`User`](../types/User.md)\> ; `onPreSaveHookError?`: (`e`: `Error`) => `void` ; `onSaveFailure?`: (`e`: `Error`) => `void` ; `onSaveSuccess?`: (`updatedEntity`: [`Entity`](../interfaces/Entity.md)\<`M`\>) => `void` ; `onSaveSuccessHookError?`: (`e`: `Error`) => `void`  } & \{ `context`: [`FireCMSContext`](../types/FireCMSContext.md)\<`UserType`\> ; `dataSource`: [`DataSource`](../interfaces/DataSource.md)  } |

#### Returns

`Promise`\<`void`\>

**`See`**

useDataSource

#### Defined in

[packages/firecms_core/src/hooks/data/save.ts:44](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/save.ts#L44)
