---
title: String
slug: it/docs/properties/config/string
sidebar_label: String
description: Configurazione per le proprietà stringa in FireCMS, incluse opzioni di archiviazione, markdown, enum e validazione.
---

La **proprietà stringa** è il tipo di campo più versatile in FireCMS. Usala per tutto, dai semplici input di testo ai caricamenti di file, agli editor di testo ricco e ai menu a discesa. Quando si crea un **pannello admin** per la propria app **Firebase**, le proprietà stringa permettono di creare:

- **Campi di testo**: Nomi, titoli, descrizioni
- **Menu a discesa**: Campi di stato, categorie, opzioni
- **Caricamenti file**: Immagini, documenti (archiviati in **Firebase Storage**)
- **Editor Markdown**: Contenuto ricco con formattazione
- **Campi Email/URL**: Tipi di input con validazione

```tsx
import { buildProperty } from "@firecms/core";

const nameProperty = buildProperty({
    name: "Nome",
    description: "Proprietà stringa di base con validazione",
    validation: { required: true },
    dataType: "string"
});
```

### `storage`

Puoi specificare una configurazione `StorageMeta`. Viene utilizzata per
indicare che questa stringa fa riferimento a un percorso in Google Cloud Storage.

* `mediaType` Tipo di media di questo riferimento, usato per visualizzare l'anteprima.
* `acceptedFiles` [Tipo MIME](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) dei file che possono essere caricati in questo riferimento. Puoi usare la notazione asterisco, quindi `image/*` accetta qualsiasi immagine.
* `metadata` Metadati specifici impostati nel file caricato.
* `fileName` Puoi usare questa prop per personalizzare il nome del file caricato.
  Puoi usare una funzione come callback o una stringa con segnaposto:
  - `{file}` - Nome completo del file
  - `{file.name}` - Nome del file senza estensione
  - `{file.ext}` - Estensione del file
  - `{rand}` - Valore casuale per evitare collisioni di nomi
  - `{entityId}` - ID dell'entità
  - `{propertyKey}` - ID di questa proprietà
  - `{path}` - Percorso di questa entità
* `storagePath` Percorso assoluto nel tuo bucket.
  Puoi usare una funzione come callback o una stringa con segnaposto:
  - `{file}` - Nome completo del file
  - `{file.name}` - Nome del file senza estensione
  - `{file.ext}` - Estensione del file
  - `{rand}` - Valore casuale per evitare collisioni di nomi
  - `{entityId}` - ID dell'entità
  - `{propertyKey}` - ID di questa proprietà
  - `{path}` - Percorso di questa entità
* `includeBucketUrl` Quando impostato su `true`, FireCMS salverà un URL di archiviazione completo invece del solo percorso.
  Per Firebase Storage è un URL `gs://...`, es. `gs://my-bucket/path/to/file.png`.
  Default `false`.
* `storeUrl` Quando impostato su `true`, indica che l'URL di download del file verrà salvato in Firestore invece del percorso Cloud Storage. L'URL generato può usare un token che, se disabilitato, potrebbe renderlo inutilizzabile. Non è consigliato. Default `false`.
* `maxSize` Dimensione massima del file in byte.
* `processFile` Usa questo callback per elaborare il file prima del caricamento.
  Se restituisci `undefined`, viene caricato il file originale.
* `postProcess` Elaborazione post-salvataggio del valore (percorso, URL o URL di download) dopo che è stato risolto.
* `previewUrl` Fornisci un URL di anteprima personalizzato per un dato nome di file.

#### Immagini: ridimensiona/comprimi prima del caricamento

FireCMS supporta l'ottimizzazione delle immagini lato client prima del caricamento:

* `imageResize` (consigliato) Configurazione avanzata di ridimensionamento e ritaglio delle immagini.
  Si applica solo alle immagini (`image/jpeg`, `image/png`, `image/webp`).
  - `maxWidth`, `maxHeight`
  - `mode`: `contain` o `cover`
  - `format`: `original`, `jpeg`, `png`, `webp`
  - `quality`: 0-100

* `imageCompression` (deprecato) Ridimensionamento/compressione immagini legacy.

```tsx
import { buildProperty } from "@firecms/core";

const imageProperty = buildProperty({
    dataType: "string",
    storage: {
        mediaType: "image",
        storagePath: (context) => {
            return "images";
        },
        acceptedFiles: ["image/*"],
        fileName: (context) => {
            return context.file.name;
        },
        includeBucketUrl: true,
        imageResize: {
            maxWidth: 1200,
            maxHeight: 1200,
            mode: "cover",
            format: "webp",
            quality: 85
        }
    }
});
```

### `url`

Se il valore di questa proprietà è un URL, puoi impostare questo flag
su `true` per aggiungere un link, o uno dei tipi di media supportati per renderizzare un'anteprima.

```tsx
import { buildProperty } from "@firecms/core";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Link Amazon",
    url: true
});
```

Puoi anche definire il tipo di anteprima per l'url: `image`, `video` o `audio`:

```tsx
import { buildProperty } from "@firecms/core";

const imageProperty = buildProperty({
    name: "Immagine",
    dataType: "string",
    url: "image",
});
```

### `email`

Se impostato su `true`, questo campo verrà validato come indirizzo email e
renderizzato con un input specifico per email. Utile per moduli di contatto,
profili utente o qualsiasi campo che dovrebbe contenere un'email valida.

```tsx
import { buildProperty } from "@firecms/core";

const emailProperty = buildProperty({
    name: "Email",
    dataType: "string",
    email: true
});
```

### `userSelect`

Questa proprietà indica che la stringa è un **ID utente** e
verrà renderizzata come un selettore utente. L'ID utente deve essere quello
usato nel tuo provider di autenticazione, es. Firebase Auth.
Puoi anche usare un property builder per specificare il percorso utente dinamicamente.

```tsx
import { buildProperty } from "@firecms/core";

const assignedUserProperty = buildProperty({
    name: "Utente Assegnato",
    dataType: "string",
    userSelect: true
});
```

### `enumValues`

Puoi usare i valori enum fornendo una mappa di possibili valori esclusivi che la
proprietà può assumere, mappati all'etichetta visualizzata nel menu a discesa.
Puoi usare un semplice oggetto con il formato `valore` => `etichetta`, o con il formato `valore`
=> [`EnumValueConfig`](../../api/type-aliases/EnumValueConfig) per personalizzazione extra
(come disabilitare opzioni specifiche o assegnare colori). Se hai bisogno di garantire
l'ordine degli elementi, puoi passare una `Map` invece di un oggetto semplice.

```tsx
import { buildProperty } from "@firecms/core";

const languageProperty = buildProperty({
    dataType: "string",
    name: "Lingua",
    enumValues: {
        "es": "Spagnolo",
        "de": "Tedesco",
        "en": "Inglese",
        "it": "Italiano",
        "fr": {
            id: "fr",
            label: "Francese",
            disabled: true
        }
    }
});
```

### `multiline`

Questa proprietà stringa è abbastanza lunga da essere visualizzata
in un campo multiriga. Default `false`. Se impostato su `true`, il numero
di righe si adatta al contenuto.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    name: "Descrizione",
    dataType: "string",
    multiline: true
});
```

### `clearable`

Aggiunge un'icona per cancellare il valore e impostarlo a `null`. Default `false`

### `markdown`

Questa proprietà stringa deve essere visualizzata come campo markdown.
Se `true`, il campo viene renderizzato come editor di testo che supporta la
sintassi markdown con evidenziazione. Include anche un'anteprima del risultato.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    dataType: "string",
    name: "Testo",
    markdown: true
});
```

### `previewAsTag`

Questa stringa deve essere renderizzata come tag invece che come semplice testo.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    name: "Tags",
    description: "Esempio di array generico",
    dataType: "array",
    of: {
        dataType: "string",
        previewAsTag: true
    }
});
```

### `validation`

* `required` Questo campo deve essere obbligatorio.
* `requiredMessage` Messaggio da visualizzare come errore di validazione.
* `unique` Il valore di questo campo deve essere univoco in questa collezione.
* `uniqueInArray` Se impostato su `true`, l'utente potrà avere quel valore di proprietà solo una volta nel
  `ArrayProperty` padre.
* `length` Imposta una lunghezza richiesta per il valore stringa.
* `min` Imposta una lunghezza minima per il valore stringa.
* `max` Imposta una lunghezza massima per il valore stringa.
* `matches` Fornisci un regex arbitrario con cui confrontare il valore.
* `email` Valida il valore come indirizzo email tramite regex.
* `url` Valida il valore come URL valido tramite regex.
* `trim` Trasforma i valori stringa rimuovendo gli spazi iniziali e finali.
* `lowercase` Trasforma il valore stringa in minuscolo.
* `uppercase` Trasforma il valore stringa in maiuscolo.

---

In base alla configurazione, i widget del campo form creati sono:

- [`TextFieldBinding`](../../api/functions/TextFieldBinding) campo di testo generico
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) se `enumValues` sono impostati, questo campo renderizza un select dove ogni opzione è un chip colorato.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding) se la proprietà ha una configurazione di archiviazione.
- [`MarkdownEditorFieldBinding`](../../api/functions/MarkdownEditorFieldBinding) se la proprietà ha una configurazione markdown.

Link:

- [API](../../api/interfaces/StringProperty)
