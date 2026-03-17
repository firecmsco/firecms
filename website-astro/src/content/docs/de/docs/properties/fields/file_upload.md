---
title: Datei-Upload
---

Verwenden Sie die Datei-Upload-Felder, um Benutzern das Hochladen von Bildern, Dokumenten oder beliebigen Dateien
in Ihre Speicherlösung (standardmäßig Firebase Storage) zu ermöglichen.

:::note
Sie können die URL der hochgeladenen Datei speichern, anstatt des Speicherpfads, indem Sie `storeUrl` setzen.
:::

Die vollständige Liste der Parameter:

* `mediaType` Medientyp dieser Referenz, wird für die Vorschau verwendet.
* `storagePath` Absoluter Pfad in Ihrem Bucket.
* `acceptedFiles` [MIME-Typ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types), der hochgeladen werden kann.
* `metadata` Spezifische Metadaten für Ihre hochgeladene Datei.
* `fileName` Callback für den Dateinamen.
* `storeUrl` Wenn auf `true` gesetzt, wird die Download-URL statt des Speicherpfads gespeichert. Standardmäßig false.
* `imageCompression` Client-seitige Bildkomprimierung. Funktioniert nur für `image/jpeg`, `image/png` und `image/webp`.

:::note
Sie können Platzhalter in `storagePath` und `fileName` verwenden:
- `{file}` - Vollständiger Dateiname
- `{file.name}` - Name der Datei ohne Erweiterung
- `{file.ext}` - Erweiterung der Datei
- `{rand}` - Zufallswert
- `{entityId}` - ID der Entity
- `{propertyKey}` - ID dieser Eigenschaft
- `{path}` - Pfad dieser Entity
:::

### Einzelner Datei-Upload

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

### Mehrfacher Datei-Upload

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
    description: "Dieses Feld erlaubt das Hochladen mehrerer Bilder gleichzeitig"
});
```

### Benutzerdefinierte Unterstützung für Bilder, Videos und Audio

FireCMS erkennt automatisch, ob die Datei ein Bild, Video oder Audio ist, und zeigt die Vorschau entsprechend an.

Unterstützte MIME-Typen für benutzerdefinierte Vorschauen: `image/*`, `video/*`, `audio/*`.
