---
id: "useEntityFetch"
title: "Function: useEntityFetch"
sidebar_label: "useEntityFetch"
sidebar_position: 0
custom_edit_url: null
---

▸ **useEntityFetch**\<`M`, `UserType`\>(`«destructured»`): [`EntityFetchResult`](../interfaces/EntityFetchResult.md)\<`M`\>

This hook is used to fetch an entity.
It gives real time updates if the datasource supports it.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |
| `UserType` | extends [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`EntityFetchProps`](../interfaces/EntityFetchProps.md)\<`M`\> |

#### Returns

[`EntityFetchResult`](../interfaces/EntityFetchResult.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/hooks/data/useEntityFetch.tsx:39](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/data/useEntityFetch.tsx#L39)
