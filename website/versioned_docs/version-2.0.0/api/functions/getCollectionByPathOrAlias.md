---
id: "getCollectionByPathOrAlias"
title: "Function: getCollectionByPathOrAlias"
sidebar_label: "getCollectionByPathOrAlias"
sidebar_position: 0
custom_edit_url: null
---

▸ **getCollectionByPathOrAlias**(`pathOrAlias`, `collections`): [`EntityCollection`](../interfaces/EntityCollection.md) \| `undefined`

Find the corresponding view at any depth for a given path.
Note that path or segments of the paths can be collection aliases.

#### Parameters

| Name | Type |
| :------ | :------ |
| `pathOrAlias` | `string` |
| `collections` | [`EntityCollection`](../interfaces/EntityCollection.md)\<`any`, `string`, [`User`](../types/User.md)\>[] |

#### Returns

[`EntityCollection`](../interfaces/EntityCollection.md) \| `undefined`

#### Defined in

[packages/firecms_core/src/core/util/navigation_utils.ts:81](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/core/util/navigation_utils.ts#L81)
