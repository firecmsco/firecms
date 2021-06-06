---
id: "storagemeta"
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

[models/models.ts:892](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L892)

___

### fileName

• `Optional` **fileName**: (`context`: [UploadedFileContext](../types/uploadedfilecontext.md)) => `string`

You can use this callback to customize the uploaded filename

**`param`**

#### Type declaration

▸ (`context`): `string`

##### Parameters

| Name | Type |
| :------ | :------ |
| `context` | [UploadedFileContext](../types/uploadedfilecontext.md) |

##### Returns

`string`

#### Defined in

[models/models.ts:903](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L903)

___

### mediaType

• `Optional` **mediaType**: [MediaType](../types/mediatype.md)

Media type of this reference, used for displaying the preview

#### Defined in

[models/models.ts:882](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L882)

___

### metadata

• `Optional` **metadata**: `UploadMetadata`

Specific metadata set in your uploaded file

#### Defined in

[models/models.ts:897](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L897)

___

### storagePath

• **storagePath**: `string` \| (`context`: [UploadedFileContext](../types/uploadedfilecontext.md)) => `string`

Absolute path in your bucket. You can specify it directly or use a callback

#### Defined in

[models/models.ts:887](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L887)

___

### storeUrl

• `Optional` **storeUrl**: `boolean`

When set to true, this flag indicates that the download URL of the file
will be saved in Firestore instead of the Cloud storage path.
Note that the generated URL may use a token that, if disabled, may
make the URL unusable and lose the original reference to Cloud Storage,
so it is not encouraged to use this flag. Defaults to false

#### Defined in

[models/models.ts:912](https://github.com/Camberi/firecms/blob/42dd384/src/models/models.ts#L912)
