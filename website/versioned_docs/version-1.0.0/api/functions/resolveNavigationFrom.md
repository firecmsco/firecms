---
id: "resolveNavigationFrom"
title: "Function: resolveNavigationFrom"
sidebar_label: "resolveNavigationFrom"
sidebar_position: 0
custom_edit_url: null
---

▸ **resolveNavigationFrom**<`M`, `UserType`\>(`__namedParameters`): `Promise`<[`ResolvedNavigationEntry`](../types/ResolvedNavigationEntry)<`M`\>[]\>

Use this function to retrieve an array of navigation entries (resolved
collection, entity or entity custom_view) for the given path. You need to pass the app context
that you receive in different callbacks, such as the save hooks.

It will take into account the `navigation` provided at the `FireCMS` level, as
well as a `schemaResolver` if provided.

#### Type parameters

| Name |
| :------ |
| `M` |
| `UserType` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.context` | [`FireCMSContext`](../interfaces/FireCMSContext)<`UserType`\> |
| `__namedParameters.path` | `string` |

#### Returns

`Promise`<[`ResolvedNavigationEntry`](../types/ResolvedNavigationEntry)<`M`\>[]\>

#### Defined in

[hooks/useResolvedNavigationFrom.tsx:64](https://github.com/Camberi/firecms/blob/2d60fba/src/hooks/useResolvedNavigationFrom.tsx#L64)
