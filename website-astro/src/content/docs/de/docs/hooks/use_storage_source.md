---
slug: de/docs/hooks/use_storage_source
title: useStorageSource
sidebar_label: useStorageSource
description: Zugriff auf die FireCMS-Speicherquelle zum Hochladen von Dateien und Abrufen von Download-URLs.
---

Verwenden Sie diesen Hook, um auf die Speicherquelle zuzugreifen, die in Ihrer FireCMS-Anwendung verwendet wird.

Jede in FireCMS hochgeladene Datei wird durch einen String in der Form `${path}/${fileName}` referenziert.

:::note
Bitte beachten Sie, dass Sie zur Verwendung dieses Hooks **in einer Komponente** sein müssen.
:::

### Verfügbare Methoden

* `uploadFile`: Eine Datei in den Speicher hochladen
* `getDownloadURL`: Einen Speicherpfad oder eine URL in eine Download-Konfiguration konvertieren
* `getFile`: Eine Datei aus einem Speicherpfad abrufen. Gibt `null` zurück, wenn die Datei nicht existiert

### Beispiel

```tsx
import React from "react";
import { useStorageSource } from "@firecms/core";

export function FileUploader() {
    const storageSource = useStorageSource();

    const handleUpload = async (file: File) => {
        const result = await storageSource.uploadFile({
            file,
            path: "uploads",
            fileName: file.name
        });
        console.log("Datei hochgeladen:", result.path);
    };

    return (
        <input type="file" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
        }}/>
    );
}
```
