---
id: "resolveNavigationFrom"
title: "Function: resolveNavigationFrom"
sidebar_label: "resolveNavigationFrom"
sidebar_position: 0
custom_edit_url: null
---

▸ **resolveNavigationFrom**\<`M`, `UserType`\>(`«destructured»`): `Promise`\<[`ResolvedNavigationEntry`](../types/ResolvedNavigationEntry.md)\<`M`\>[]\>

Use this function to retrieve an array of navigation entries (resolved
collection, entity or entity custom_view) for the given path. You need to pass the app context
that you receive in different callbacks, such as the save hooks.

It will take into account the `navigation` provided at the `FireCMS` level.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |
| `UserType` | extends [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `context` | [`FireCMSContext`](../types/FireCMSContext.md)\<`UserType`\> |
| › `path` | `string` |

#### Returns

`Promise`\<[`ResolvedNavigationEntry`](../types/ResolvedNavigationEntry.md)\<`M`\>[]\>

#### Defined in

[packages/firecms_core/src/hooks/useResolvedNavigationFrom.tsx:58](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useResolvedNavigationFrom.tsx#L58)
