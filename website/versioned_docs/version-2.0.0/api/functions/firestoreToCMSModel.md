---
id: "firestoreToCMSModel"
title: "Function: firestoreToCMSModel"
sidebar_label: "firestoreToCMSModel"
sidebar_position: 0
custom_edit_url: null
---

▸ **firestoreToCMSModel**(`data`): `any`

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

#### Returns

`any`

#### Defined in

[lib/src/firebase_app/hooks/useFirestoreDataSource.ts:530](https://github.com/FireCMSco/firecms/blob/b01ca637/lib/src/firebase_app/hooks/useFirestoreDataSource.ts#L530)
