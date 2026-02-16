---
slug: docs/hooks/use_storage_source
title: useStorageSource
sidebar_label: useStorageSource
description: Access the FireCMS storage source for uploading files and retrieving download URLs. Works with Firebase Storage or any custom storage implementation.
---

Use this hook to access the storage source being used in your FireCMS application.

Each file uploaded in FireCMS is referenced by a string in the form
`${path}/${fileName}`, which is then referenced in the datasource as a string
value in properties that have a storage configuration.

You can use this controller to upload files and get the storage path where it
was stored. Then you can convert that storagePath into a download URL.

:::note
Please note that in order to use this hook you **must** be in
a component (you can't use it directly from a callback function).
:::

### Available Methods

* `uploadFile`: Upload a file, specifying the file, name, and path
* `getDownloadURL`: Convert a storage path into a download URL

### Example

```tsx
import React from "react";
import { useStorageSource } from "@firecms/core";
import { Button } from "@firecms/ui";

export function FileUploader() {
    const storageSource = useStorageSource();

    const handleUpload = async (file: File) => {
        const result = await storageSource.uploadFile({
            file,
            fileName: file.name,
            path: "uploads",
        });
        console.log("File uploaded to:", result.path);
    };

    return (
        <input
            type="file"
            onChange={(e) => {
                if (e.target.files?.[0]) {
                    handleUpload(e.target.files[0]);
                }
            }}
        />
    );
}
```
