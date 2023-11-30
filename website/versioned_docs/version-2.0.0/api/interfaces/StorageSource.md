---
id: "StorageSource"
title: "Interface: StorageSource"
sidebar_label: "StorageSource"
sidebar_position: 0
custom_edit_url: null
---

## Properties

### getDownloadURL

• **getDownloadURL**: (`pathOrUrl`: `string`) => `Promise`\<[`DownloadConfig`](DownloadConfig.md)\>

#### Type declaration

▸ (`pathOrUrl`): `Promise`\<[`DownloadConfig`](DownloadConfig.md)\>

Convert a storage path or URL into a download configuration

##### Parameters

| Name | Type |
| :------ | :------ |
| `pathOrUrl` | `string` |

##### Returns

`Promise`\<[`DownloadConfig`](DownloadConfig.md)\>

#### Defined in

[packages/firecms_core/src/types/storage.ts:88](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/storage.ts#L88)

___

### getFile

• **getFile**: (`path`: `string`) => `Promise`\<``null`` \| `File`\>

#### Type declaration

▸ (`path`): `Promise`\<``null`` \| `File`\>

Get a file from a storage path.
It returns null if the file does not exist.

##### Parameters

| Name | Type |
| :------ | :------ |
| `path` | `string` |

##### Returns

`Promise`\<``null`` \| `File`\>

#### Defined in

[packages/firecms_core/src/types/storage.ts:95](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/storage.ts#L95)

___

### uploadFile

• **uploadFile**: (`__namedParameters`: [`UploadFileProps`](UploadFileProps.md)) => `Promise`\<[`UploadFileResult`](UploadFileResult.md)\>

#### Type declaration

▸ (`«destructured»`): `Promise`\<[`UploadFileResult`](UploadFileResult.md)\>

Upload a file, specifying a name and a path

##### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | [`UploadFileProps`](UploadFileProps.md) |

##### Returns

`Promise`\<[`UploadFileResult`](UploadFileResult.md)\>

#### Defined in

[packages/firecms_core/src/types/storage.ts:77](https://github.com/FireCMSco/firecms/blob/d45f3739/packages/firecms_core/src/types/storage.ts#L77)
