---
id: "deleteEntityWithCallbacks"
title: "Function: deleteEntityWithCallbacks"
sidebar_label: "deleteEntityWithCallbacks"
sidebar_position: 0
custom_edit_url: null
---

▸ **deleteEntityWithCallbacks**<`M`, `UserType`\>(`__namedParameters`): `Promise`<`boolean`\>

This function is in charge of deleting an entity in the datasource.
It will run all the delete callbacks specified in the schema.
It is also possible to attach callbacks on save success or error, and callback
errors.

If you just want to delete the data without running the `onPreDelete`,
and `onDelete` callbacks, you can use the `deleteEntity` method
in the datasource ([useDataSource](useDataSource)).

#### Type parameters

| Name |
| :------ |
| `M` |
| `UserType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`DeleteEntityProps`](../interfaces/DeleteEntityProps)<`M`\> & { `callbacks?`: [`EntityCallbacks`](../interfaces/EntityCallbacks)<`M`\> ; `onDeleteFailure?`: (`entity`: [`Entity`](../interfaces/Entity)<`M`\>, `e`: `Error`) => `void` ; `onDeleteSuccess?`: (`entity`: [`Entity`](../interfaces/Entity)<`M`\>) => `void` ; `onDeleteSuccessHookError?`: (`entity`: [`Entity`](../interfaces/Entity)<`M`\>, `e`: `Error`) => `void` ; `onPreDeleteHookError?`: (`entity`: [`Entity`](../interfaces/Entity)<`M`\>, `e`: `Error`) => `void`  } & { `context`: [`FireCMSContext`](../interfaces/FireCMSContext)<`UserType`\> ; `dataSource`: [`DataSource`](../interfaces/DataSource) ; `schema`: [`ResolvedEntitySchema`](../types/ResolvedEntitySchema)<`M`\>  } |

#### Returns

`Promise`<`boolean`\>

#### Defined in

[hooks/data/delete.ts:45](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/data/delete.ts#L45)
