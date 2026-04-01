---
slug: de/docs/hooks/use_storage_source
title: useStorageSource
sidebar_label: useStorageSource
description: Zugriff auf die FireCMS-Speicherquelle zum Hochladen von Dateien und Abrufen von Download-URLs. Funktioniert mit Firebase Storage oder jeder benutzerdefinierten Speicherimplementierung.
---

Verwenden Sie diesen Hook, um auf die Speicherquelle zuzugreifen, die in Ihrer FireCMS-Anwendung verwendet wird.

Jede in FireCMS hochgeladene Datei wird durch eine Zeichenkette in der Form
`${path}/${fileName}` referenziert, die dann in der Datenquelle als Zeichenkettenwert
in Eigenschaften mit einer Speicherkonfiguration referenziert wird.

Sie können diesen Controller verwenden, um Dateien hochzuladen und den Speicherpfad zu erhalten, unter dem sie
gespeichert wurde. Anschließend können Sie diesen Speicherpfad in eine Download-URL umwandeln.

:::note
Bitte beachten Sie, dass Sie diesen Hook **nur** innerhalb
einer Komponente verwenden können (Sie können ihn nicht direkt in einer Callback-Funktion verwenden).
:::

### Verfügbare Methoden

* `uploadFile`: Eine Datei hochladen, unter Angabe der Datei, des Namens und des Pfads
* `getDownloadURL`: Einen Speicherpfad in eine Download-URL umwandeln

### Beispiel

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
        console.log("Datei hochgeladen nach:", result.path);
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
