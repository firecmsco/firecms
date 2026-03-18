---
slug: it/docs/hooks/use_storage_source
title: useStorageSource
sidebar_label: useStorageSource
description: Accedi alla fonte di archiviazione di FireCMS per caricare file e ottenere URL di download. Funziona con Firebase Storage o qualsiasi implementazione di archiviazione personalizzata.
---

Usa questo hook per accedere alla fonte di archiviazione utilizzata nella tua applicazione FireCMS.

Ogni file caricato in FireCMS è referenziato da una stringa nella forma
`${path}/${fileName}`, che viene poi referenziata nella fonte dati come valore
stringa nelle proprietà che hanno una configurazione di archiviazione.

Puoi usare questo controller per caricare file e ottenere il percorso di archiviazione dove è stato
salvato. Poi puoi convertire quel percorso di archiviazione in un URL di download.

:::note
Tieni presente che per utilizzare questo hook **devi** essere all'interno
di un componente (non puoi usarlo direttamente da una funzione callback).
:::

### Metodi disponibili

* `uploadFile`: Caricare un file, specificando il file, il nome e il percorso
* `getDownloadURL`: Convertire un percorso di archiviazione in un URL di download

### Esempio

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
        console.log("File caricato in:", result.path);
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
