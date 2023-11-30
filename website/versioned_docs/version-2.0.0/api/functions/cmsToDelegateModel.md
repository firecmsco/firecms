---
id: "cmsToDelegateModel"
title: "Function: cmsToDelegateModel"
sidebar_label: "cmsToDelegateModel"
sidebar_position: 0
custom_edit_url: null
---

▸ **cmsToDelegateModel**(`data`, `buildReference`, `buildGeoPoint`, `buildDate`, `buildDelete`): `any`

Recursive function that converts Firestore data types into CMS or plain
JS types.
FireCMS uses Javascript dates internally instead of Firestore timestamps.
This makes it easier to interact with the rest of the libraries and
bindings.
Also, Firestore references are replaced with [EntityReference](../classes/EntityReference.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |
| `buildReference` | (`reference`: [`EntityReference`](../classes/EntityReference.md)) => `any` |
| `buildGeoPoint` | (`geoPoint`: [`GeoPoint`](../classes/GeoPoint.md)) => `any` |
| `buildDate` | (`date`: `Date`) => `any` |
| `buildDelete` | () => `any` |

#### Returns

`any`

#### Defined in

[packages/firecms_core/src/hooks/useBuildDataSource.ts:328](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/hooks/useBuildDataSource.ts#L328)
