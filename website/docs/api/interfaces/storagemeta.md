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

[models/properties.ts:489](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L489)

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

[models/properties.ts:500](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L500)

___

### mediaType

• `Optional` **mediaType**: [MediaType](../types/mediatype.md)

Media type of this reference, used for displaying the preview

#### Defined in

[models/properties.ts:479](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L479)

___

### metadata

• `Optional` **metadata**: `UploadMetadata`

Specific metadata set in your uploaded file

#### Defined in

[models/properties.ts:494](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L494)

___

### storagePath

• **storagePath**: `string` \| (`context`: [UploadedFileContext](../types/uploadedfilecontext.md)) => `string`

Absolute path in your bucket. You can specify it directly or use a callback

#### Defined in

[models/properties.ts:484](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L484)

___

### storeUrl

• `Optional` **storeUrl**: `boolean`

When set to true, this flag indicates that the download URL of the file
will be saved in Firestore instead of the Cloud storage path.
Note that the generated URL may use a token that, if disabled, may
make the URL unusable and lose the original reference to Cloud Storage,
so it is not encouraged to use this flag. Defaults to false

#### Defined in

[models/properties.ts:509](https://github.com/Camberi/firecms/blob/b1328ad/src/models/properties.ts#L509)
