---
id: "useResolvedNavigationFrom"
title: "Function: useResolvedNavigationFrom"
sidebar_label: "useResolvedNavigationFrom"
sidebar_position: 0
custom_edit_url: null
---

▸ **useResolvedNavigationFrom**\<`M`, `UserType`\>(`«destructured»`): [`NavigationFrom`](../interfaces/NavigationFrom.md)\<`M`\>

Use this hook to retrieve an array of navigation entries (resolved
collection or entity) for the given path. You can use this hook
in any React component that lives under `FireCMS`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `M` | extends `Record`\<`string`, `any`\> |
| `UserType` | extends [`User`](../types/User.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`NavigationFromProps`](../interfaces/NavigationFromProps.md) |

#### Returns

[`NavigationFrom`](../interfaces/NavigationFrom.md)\<`M`\>

#### Defined in

[packages/firecms_core/src/hooks/useResolvedNavigationFrom.tsx:129](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useResolvedNavigationFrom.tsx#L129)
