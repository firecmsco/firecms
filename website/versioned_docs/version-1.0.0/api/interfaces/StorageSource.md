---
id: "StorageSource"
title: "Interface: StorageSource"
sidebar_label: "StorageSource"
sidebar_position: 0
custom_edit_url: null
---

## Methods

### getDownloadURL

▸ **getDownloadURL**(`path`): `Promise`<`string`\>

Convert a storage path into a download url

#### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[models/storage.ts:43](https://github.com/Camberi/firecms/blob/2d60fba/src/models/storage.ts#L43)

___

### uploadFile

▸ **uploadFile**(`__namedParameters`): `Promise`<[`UploadFileResult`](UploadFileResult)\>

Upload a file, specifying a name and a path

#### Parameters

| Name | Type |
| :------ | :------ |
| `__namedParameters` | [`UploadFileProps`](UploadFileProps) |

#### Returns

`Promise`<[`UploadFileResult`](UploadFileResult)\>

#### Defined in

[models/storage.ts:32](https://github.com/Camberi/firecms/blob/2d60fba/src/models/storage.ts#L32)
