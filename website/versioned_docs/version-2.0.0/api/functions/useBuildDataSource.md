---
id: "useBuildDataSource"
title: "Function: useBuildDataSource"
sidebar_label: "useBuildDataSource"
sidebar_position: 0
custom_edit_url: null
---

▸ **useBuildDataSource**(`«destructured»`): [`DataSource`](../interfaces/DataSource.md)

Use this hook to build a [DataSource](../interfaces/DataSource.md) based on Firestore

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `customFields` | `Record`\<`string`, [`PropertyConfig`](../types/PropertyConfig.md)\> |
| › `delegate` | [`DataSourceDelegate`](../interfaces/DataSourceDelegate.md) |

#### Returns

[`DataSource`](../interfaces/DataSource.md)

#### Defined in

[packages/firecms_core/src/hooks/useBuildDataSource.ts:28](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useBuildDataSource.ts#L28)
