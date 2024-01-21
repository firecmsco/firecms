---
id: file_upload
title: File upload
---

Use the file upload fields to allow users to upload images, documents or any
files to your storage solution (Firebase storage by default). This field is in
charge of uploading the file and saving the storage path as the value
of your property.

:::note
You can save the URL of the uploaded file, instead of the Storage pah,
by setting the `storeUrl`.
:::

You can also allow the upload of only some file types based on
the [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
, or restrict the file size.

If the file uploaded is an image, you can also choose to resize it before
it gets uploaded to the storage backend, with the `imageCompression` prop.

The complete list of params you can use when uploading files:

* `mediaType` Media type of this reference, used for displaying the
  preview.
* `storagePath` Absolute path in your bucket. You can specify it
  directly or use a callback
* `acceptedFiles`
  File [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
  that can be uploaded to this
  reference. Note that you can also use the asterisk notation, so `image/*`
  accepts any image file, and so on.
* `metadata` Specific metadata set in your uploaded file.
* `fileName` You can specify a fileName callback if you need to
  customize the name of the file
* `storagePath` You can specify a storage path callback if you need to
  customize the path where it is stored.
* `storeUrl` When set to `true`, this flag indicates that the download
  URL of the file will be saved in Firestore instead of the Cloud
  storage path. Note that the generated URL may use a token that, if
  disabled, may make the URL unusable and lose the original reference to
  Cloud Storage, so it is not encouraged to use this flag. Defaults to
  false.
* `imageCompression` Use client side image compression and resizing
  Will only be applied to these MIME types: `image/jpeg`, `image/png`
  and `image/webp`

:::note
You can use some placeholders in the `storagePath` and `fileName` to
customize the path and name of the file. The available placeholders are:

- \{file\} - Full file name
- \{file.name\} - Name of the file without extension
- \{file.ext\} - Extension of the file
- \{rand\} - Random value used to avoid name collisions
- \{entityId\} - ID of the entity
- \{propertyKey\} - ID of this property
- \{path\} - Path of this entity
:::

### Single file upload

![Field](/img/fields/File_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Image",
    storage: {
        storagePath: "images",
        acceptedFiles: ["image/*"],
        maxSize: 1024 * 1024,
        metadata: {
            cacheControl: "max-age=1000000"
        },
        fileName: (context) => {
            return context.file.name;
        }
    }
});
```

The data type is [`string`](../config/string).

Internally the component used
is [`StorageUploadFieldBinding`].

### Multiple file upload

![Field](/img/fields/Multi_file_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Images",
    of: {
        dataType: "string",
        storage: {
            storagePath: "images",
            acceptedFiles: ["image/*"],
            metadata: {
                cacheControl: "max-age=1000000"
            }
        }
    },
    description: "This fields allows uploading multiple images at once"
});
```

The data type is [`array`](../config/array).

Internally the component used
is [`StorageUploadFieldBinding`].

### Custom support for images, videos and audio

You are free to use the `storage` property to upload any kind of file, but
FireCMS also provides some custom support for images, videos and audio.

You don't need to make any specific changes and this behaviour is enabled by
default. FireCMS will automatically detect if the file is an image, video or
audio and will display the preview accordingly.

The MIME types supported for custom previews are:

- `image/*`
- `video/*`
- `audio/*`

(this includes all file formats related to these categories)
