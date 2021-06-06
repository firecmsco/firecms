---
id: "uploadedfilecontext"
title: "Type alias: UploadedFileContext"
sidebar_label: "UploadedFileContext"
sidebar_position: 0
custom_edit_url: null
---

Ƭ **UploadedFileContext**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `entityId?` | `string` | Entity Id is set if the entity already exists |
| `entityValues` | [EntityValues](entityvalues.md)<any\> | Values of the current entity |
| `file` | `File` | Uploaded file |
| `name` | `string` | Property field name |
| `property` | [Property](property.md) | Property related to this upload |
| `storageMeta` | [StorageMeta](../interfaces/storagemeta.md) | Storage meta specified by the developer |

#### Defined in

[models/models.ts:916](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L916)
