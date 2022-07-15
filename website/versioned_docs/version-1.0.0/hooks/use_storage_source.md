---
id: use_storage_source
title: useStorageSource
sidebar_label: useStorageSource
---

Use this hook to get the storage source being used.

Each file uploaded in FireCMS is referenced by a string in the form
`${path}/{$fileName}`, which is then referenced in the datasource, as a string
value in properties that have a storage configuration.

You can use this controller to upload files and get the storage path where it
was stored. Then you can convert that storagePath into a download URL

* `uploadFile`: Upload a file, specifying a name and a path
* `getDownloadURL`: Convert a storage path into a download url
