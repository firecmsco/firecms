---
id: file_upload
title: File upload
---

Use the file upload fields to allow users to upload images, documents or any
files to your storage solution (Firebase storage by default). This field is in
charge of uploading the file and saving the storage path as the value
of your property.

You can modify some configuration parameters like the path where the file is
stored, or it's name. For the `storagePath` and `fileName` you can use some
placeholders that get replaced with the corresponding values.

- {file} - Full file name
- {file.name} - Name of the file without extension
- {file.ext} - Extension of the file
- {rand} - Random value used to avoid name collisions
- {entityId} - ID of the entity
- {propertyKey} - ID of this property
- {path} - Path of this entity

You can also allow the upload of only some file types based on the MIME type, or
restrict the file size.

### Single file upload

![Field](/img/fields/File_upload.png)

```typescript jsx
import { buildProperty } from "@camberi/firecms";

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
is [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).


### Multiple file upload

![Field](/img/fields/Multi_file_upload.png)

```typescript jsx
import { buildProperty } from "@camberi/firecms";

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
is [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).
