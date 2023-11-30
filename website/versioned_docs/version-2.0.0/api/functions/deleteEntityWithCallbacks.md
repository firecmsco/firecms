---
id: "deleteEntityWithCallbacks"
title: "Function: deleteEntityWithCallbacks"
sidebar_label: "deleteEntityWithCallbacks"
sidebar_position: 0
custom_edit_url: null
---

▸ **deleteEntityWithCallbacks**\<`M`, `UserType`\>(`«destructured»`): `Promise`\<`boolean`\>

This function is in charge of deleting an entity in the datasource.
It will run all the delete callbacks specified in the collection.
It is also possible to attach callbacks on save success or error, and callback
errors.

If you just want to delete any data without running the `onPreDelete`,
and `onDelete` callbacks, you can use the `deleteEntity` method
in the datasource ([useDataSource](useDataSource.md)).

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |
| `UserType` | extends [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`DeleteEntityProps`](../interfaces/DeleteEntityProps.md)\<`M`\> & \{ `callbacks?`: [`EntityCallbacks`](../interfaces/EntityCallbacks.md)\<`M`, [`User`](../types/User.md)\> ; `onDeleteFailure?`: (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>, `e`: `Error`) => `void` ; `onDeleteSuccess?`: (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>) => `void` ; `onDeleteSuccessHookError?`: (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>, `e`: `Error`) => `void` ; `onPreDeleteHookError?`: (`entity`: [`Entity`](../interfaces/Entity.md)\<`M`\>, `e`: `Error`) => `void`  } & \{ `collection`: [`ResolvedEntityCollection`](../types/ResolvedEntityCollection.md)\<`M`\> ; `context`: [`FireCMSContext`](../types/FireCMSContext.md)\<`UserType`\> ; `dataSource`: [`DataSource`](../interfaces/DataSource.md)  } |

#### Returns

`Promise`\<`boolean`\>

#### Defined in

[packages/firecms_core/src/hooks/data/delete.ts:46](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/delete.ts#L46)
