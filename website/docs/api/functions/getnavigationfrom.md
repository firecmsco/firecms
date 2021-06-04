---
id: "getnavigationfrom"
title: "Function: getNavigationFrom"
sidebar_label: "getNavigationFrom"
sidebar_position: 0
custom_edit_url: null
---

▸ **getNavigationFrom**(`__namedParameters`): `Promise`<[NavigationEntry](../types/navigationentry.md)[]\>

Use this function to retrieve an array of navigation entries (resolved
collection or entity) for the given path. You need to pass the app context
that you receive in different callbacks, such as the save hooks.

It will take into account the `navigation` provided at the `CMSApp` level, as
well as a `schemaResolver` if provided.

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | `Object` |
| `__namedParameters.context` | `CMSAppContext` |
| `__namedParameters.path` | `string` |

#### Returns

`Promise`<[NavigationEntry](../types/navigationentry.md)[]\>

#### Defined in

[hooks/useNavigationFrom.tsx:34](https://github.com/Camberi/firecms/blob/42dd384/src/hooks/useNavigationFrom.tsx#L34)
