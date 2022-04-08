---
id: "StorageMeta"
title: "Interface: StorageMeta"
sidebar_label: "StorageMeta"
sidebar_position: 0
custom_edit_url: null
---

Additional configuration related to Storage related fields

## Properties

### acceptedFiles

• `Optional` **acceptedFiles**: `string`[]

File MIME types that can be uploaded to this reference

#### Defined in

[models/properties.ts:617](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L617)

___

### mediaType

• `Optional` **mediaType**: [`MediaType`](../types/MediaType)

Media type of this reference, used for displaying the preview

#### Defined in

[models/properties.ts:607](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L607)

___

### metadata

• `Optional` **metadata**: `any`

Specific metadata set in your uploaded file.
For the default Firebase implementation, the values passed here are of type
`firebase.storage.UploadMetadata`

#### Defined in

[models/properties.ts:624](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L624)

___

### storagePath

• **storagePath**: `string` \| (`context`: [`UploadedFileContext`](UploadedFileContext)) => `string`

Absolute path in your bucket. You can specify it directly or use a callback

#### Defined in

[models/properties.ts:612](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L612)

___

### storeUrl

• `Optional` **storeUrl**: `boolean`

When set to true, this flag indicates that the download URL of the file
will be saved in the datasource instead of the Cloud storage path.
Note that the generated URL may use a token that, if disabled, may
make the URL unusable and lose the original reference to Cloud Storage,
so it is not encouraged to use this flag. Defaults to false

#### Defined in

[models/properties.ts:639](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L639)

## Methods

### fileName

▸ `Optional` **fileName**(`context`): `string`

You can use this callback to customize the uploaded filename

#### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [`UploadedFileContext`](UploadedFileContext) |

#### Returns

`string`

#### Defined in

[models/properties.ts:630](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L630)

___

### postProcess

▸ `Optional` **postProcess**(`pathOrUrl`): `Promise`<`string`\>

Post process the path

#### Parameters

| Name | Type |
| :------ | :------ |
| `pathOrUrl` | `string` |

#### Returns

`Promise`<`string`\>

#### Defined in

[models/properties.ts:644](https://github.com/Camberi/firecms/blob/2d60fba/src/models/properties.ts#L644)
