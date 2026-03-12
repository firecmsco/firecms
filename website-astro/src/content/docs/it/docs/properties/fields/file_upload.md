---
slug: it/docs/properties/fields/file_upload
title: Caricamento file
---

Usa i campi di caricamento file per consentire agli utenti di caricare immagini, documenti o qualsiasi
file nella tua soluzione di archiviazione (Firebase Storage per default). Questo campo si occupa
di caricare il file e salvare il percorso di archiviazione come valore della tua proprietà.

:::note
Puoi salvare l'URL del file caricato invece del percorso di archiviazione,
impostando `storeUrl`.
:::

Puoi anche consentire il caricamento solo di alcuni tipi di file in base al
[tipo MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types),
o limitare la dimensione del file.

Se il file caricato è un'immagine, puoi anche scegliere di ridimensionarla prima
che venga caricata nel backend di archiviazione, con la prop `imageCompression`.

L'elenco completo dei parametri disponibili per il caricamento file:

* `mediaType` Tipo di media di questo riferimento, usato per visualizzare l'anteprima.
* `storagePath` Percorso assoluto nel tuo bucket. Puoi specificarlo
  direttamente o usare un callback.
* `acceptedFiles` [Tipo MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) dei file che possono essere caricati. Puoi usare la notazione asterisco, quindi `image/*` accetta qualsiasi immagine.
* `metadata` Metadati specifici impostati nel file caricato.
* `fileName` Puoi specificare un callback per il nome del file se hai bisogno di personalizzarlo.
* `storagePath` Puoi specificare un callback per il percorso di archiviazione se hai bisogno di personalizzarlo.
* `storeUrl` Quando impostato su `true`, l'URL di download del file verrà salvato in Firestore invece del percorso Cloud Storage. L'URL generato potrebbe usare un token che, se disabilitato, lo rende inutilizzabile. Non è consigliato. Default `false`.
* `imageCompression` Usa la compressione e il ridimensionamento delle immagini lato client.
  Applicato solo a questi tipi MIME: `image/jpeg`, `image/png` e `image/webp`.

:::note
Puoi usare alcuni segnaposto in `storagePath` e `fileName` per
personalizzare il percorso e il nome del file. I segnaposto disponibili sono:

- \{file\} - Nome completo del file
- \{file.name\} - Nome del file senza estensione
- \{file.ext\} - Estensione del file
- \{rand\} - Valore casuale per evitare collisioni di nomi
- \{entityId\} - ID dell'entità
- \{propertyKey\} - ID di questa proprietà
- \{path\} - Percorso di questa entità
:::

### Caricamento file singolo

![Field](/img/fields/File_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Immagine",
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

Il tipo di dato è [`string`](../config/string).

Il componente utilizzato internamente
è [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).

### Caricamento file multiplo

![Field](/img/fields/Multi_file_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Immagini",
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
    description: "Questo campo permette di caricare più immagini contemporaneamente"
});
```

Il tipo di dato è [`array`](../config/array).

Il componente utilizzato internamente
è [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).

### Supporto personalizzato per immagini, video e audio

Puoi usare liberamente la proprietà `storage` per caricare qualsiasi tipo di file, ma
FireCMS fornisce anche supporto personalizzato per immagini, video e audio.

Non è necessario apportare modifiche specifiche e questo comportamento è abilitato
per default. FireCMS rileverà automaticamente se il file è un'immagine, un video o
un audio e mostrerà l'anteprima di conseguenza.

I tipi MIME supportati per le anteprime personalizzate sono:

- `image/*`
- `video/*`
- `audio/*`

(include tutti i formati di file correlati a queste categorie)
