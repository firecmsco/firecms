---
title: String
sidebar_label: String
description: Konfiguration für String-Eigenschaften in FireCMS, einschließlich Speicher, Markdown, Enums und Validierungsoptionen.
---

Die **String-Eigenschaft** ist der vielseitigste Feldtyp in FireCMS. Verwenden Sie sie für alles, von einfachen Texteingaben bis hin zu Datei-Uploads, Rich-Text-Editoren und Dropdowns. Beim Erstellen eines **Admin-Panels** für Ihre **Firebase**-App ermöglichen String-Eigenschaften:

- **Textfelder**: Namen, Titel, Beschreibungen
- **Auswahl-Dropdowns**: Statusfelder, Kategorien, Optionen
- **Datei-Uploads**: Bilder, Dokumente (gespeichert in **Firebase Storage**)
- **Markdown-Editoren**: Reichhaltiger Inhalt mit Formatierung
- **E-Mail/URL-Felder**: Validierte Eingabetypen

```tsx
import { buildProperty } from "@firecms/core";

const nameProperty = buildProperty({
    name: "Name",
    description: "Basic string property with validation",
    validation: { required: true },
    dataType: "string"
});
```

### `storage`

Sie können eine `StorageMeta`-Konfiguration angeben. Diese wird verwendet, um
anzuzeigen, dass dieser String auf einen Pfad in Google Cloud Storage verweist.

* `mediaType` Medientyp dieser Referenz, verwendet für die Anzeige der Vorschau.
* `acceptedFiles` Datei-[MIME-Typ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types), der zu dieser Referenz hochgeladen werden kann. Beachten Sie, dass Sie auch die Asterisk-Notation verwenden können, sodass `image/*` jede Bilddatei akzeptiert.
* `metadata` Spezifische Metadaten, die in Ihrer hochgeladenen Datei gesetzt werden.
* `fileName` Sie können diese Prop verwenden, um den hochgeladenen Dateinamen anzupassen.
  Sie können eine Funktion als Callback oder einen String verwenden, in dem Sie
  Platzhalter angeben, die durch die entsprechenden Werte ersetzt werden.
  - `{file}` - Vollständiger Dateiname
  - `{file.name}` - Dateiname ohne Erweiterung
  - `{file.ext}` - Dateierweiterung
  - `{rand}` - Zufallswert zur Vermeidung von Namenskollisionen
  - `{entityId}` - ID der Entität
  - `{propertyKey}` - ID dieser Eigenschaft
  - `{path}` - Pfad dieser Entität
* `storagePath` Absoluter Pfad in Ihrem Bucket.
  Sie können eine Funktion als Callback oder einen String verwenden, in dem Sie
  Platzhalter angeben, die durch die entsprechenden Werte ersetzt werden.
  - `{file}` - Vollständiger Dateiname
  - `{file.name}` - Dateiname ohne Erweiterung
  - `{file.ext}` - Dateierweiterung
  - `{rand}` - Zufallswert zur Vermeidung von Namenskollisionen
  - `{entityId}` - ID der Entität
  - `{propertyKey}` - ID dieser Eigenschaft
  - `{path}` - Pfad dieser Entität
* `includeBucketUrl` Wenn auf `true` gesetzt, speichert FireCMS eine vollständige
  Storage-URL anstelle nur des Speicherpfads.
  Für Firebase Storage ist dies eine `gs://...`-URL, z.B.
  `gs://my-bucket/path/to/file.png`.
  Standardmäßig `false`.
* `storeUrl` Wenn auf `true` gesetzt, zeigt dieses Flag an, dass die Download-URL
  der Datei in Firestore gespeichert wird anstelle des Cloud Storage-Pfads. Beachten Sie, dass die generierte URL möglicherweise einen Token verwendet, der bei Deaktivierung die URL unbrauchbar machen und den ursprünglichen Verweis auf Cloud Storage verlieren kann. Es wird daher nicht empfohlen, dieses Flag zu verwenden. Standardmäßig `false`.
* `maxSize` Maximale Dateigröße in Bytes.
* `processFile` Verwenden Sie diesen Callback, um die Datei vor dem Hochladen zu verarbeiten.
  Wenn Sie `undefined` zurückgeben, wird die Originaldatei hochgeladen.
* `postProcess` Nachbearbeitung des gespeicherten Werts (Speicherpfad, Storage-URL oder Download-URL) nach der Auflösung.
* `previewUrl` Stellen Sie eine benutzerdefinierte Vorschau-URL für einen bestimmten Dateinamen bereit.

#### Bilder: Größe ändern/komprimieren vor dem Hochladen

FireCMS unterstützt clientseitige Bildoptimierung vor dem Hochladen:

* `imageResize` (empfohlen) Erweiterte Konfiguration für Bildgrößenänderung und -beschneidung.
  Wird nur auf Bilder angewendet (`image/jpeg`, `image/png`, `image/webp`).
  - `maxWidth`, `maxHeight`
  - `mode`: `contain` oder `cover`
  - `format`: `original`, `jpeg`, `png`, `webp`
  - `quality`: 0-100

* `imageCompression` (veraltet) Legacy-Bildgrößenänderung/-komprimierung.

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

Wenn der Wert dieser Eigenschaft eine URL ist, können Sie dieses Flag
auf `true` setzen, um einen Link hinzuzufügen, oder einen der unterstützten Medientypen, um eine
Vorschau zu rendern.

```tsx
import { buildProperty } from "@firecms/core";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Amazon link",
    url: true
});
```

Sie können auch den Vorschautyp für die URL definieren: `image`, `video` oder `audio`:

```tsx
import { buildProperty } from "@firecms/core";

const imageProperty = buildProperty({
    name: "Image",
    dataType: "string",
    url: "image",
});
```

### `email`

Wenn auf `true` gesetzt, wird dieses Feld als E-Mail-Adresse validiert und
mit einem E-Mail-spezifischen Input gerendert. Nützlich für Kontaktformulare,
Benutzerprofile oder jedes Feld, das eine gültige E-Mail enthalten soll.

```tsx
import { buildProperty } from "@firecms/core";

const emailProperty = buildProperty({
    name: "Email",
    dataType: "string",
    email: true
});
```

### `userSelect`

Diese Eigenschaft gibt an, dass der String eine **Benutzer-ID** ist und
als Benutzerauswahl gerendert wird. Beachten Sie, dass die Benutzer-ID diejenige sein muss,
die in Ihrem Authentifizierungsanbieter verwendet wird, z.B. Firebase Auth.
Sie können auch einen Property Builder verwenden, um den Benutzerpfad dynamisch
basierend auf anderen Werten der Entität anzugeben.

```tsx
import { buildProperty } from "@firecms/core";

const assignedUserProperty = buildProperty({
    name: "Assigned User",
    dataType: "string",
    userSelect: true
});
```

### `enumValues`

Sie können die Enum-Werte verwenden, indem Sie eine Map möglicher exklusiver Werte bereitstellen, die die
Eigenschaft annehmen kann, zugeordnet zum Label, das im Dropdown angezeigt wird. Sie
können ein einfaches Objekt mit dem Format
`value` => `label` verwenden, oder mit dem Format `value`
=> [`EnumValueConfig`](../../api/type-aliases/EnumValueConfig), wenn Sie zusätzliche
Anpassungen benötigen (wie das Deaktivieren bestimmter Optionen oder das Zuweisen von Farben). Wenn Sie
die Reihenfolge der Elemente sicherstellen müssen, können Sie eine `Map` anstelle eines
einfachen Objekts übergeben.

```tsx
import { buildProperty } from "@firecms/core";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Amazon link",
    enumValues: {
        "es": "Spanish",
        "de": "German",
        "en": "English",
        "it": "Italian",
        "fr": {
            id: "fr",
            label: "French",
            disabled: true
        }
    }
});
```

### `multiline`

Ist diese String-Eigenschaft lang genug, um in einem mehrzeiligen Feld angezeigt zu werden. Standardmäßig false. Wenn auf `true` gesetzt, passt sich die Anzahl der Zeilen an den Inhalt an.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    name: "Description",
    dataType: "string",
    multiline: true
});
```

### `clearable`

Fügt ein Symbol zum Löschen des Werts hinzu und setzt ihn auf `null`. Standardmäßig `false`

### `markdown`

Soll diese String-Eigenschaft als Markdown-Feld angezeigt werden.
Wenn `true`, wird das Feld als Texteditor gerendert, der Markdown-
Hervorhebungssyntax unterstützt. Es enthält auch eine Vorschau des Ergebnisses.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    dataType: "string",
    name: "Text",
    markdown: true
});
```

### `previewAsTag`

Soll dieser String als Tag anstatt als Text gerendert werden.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    name: "Tags",
    description: "Example of generic array",
    dataType: "array",
    of: {
        dataType: "string",
        previewAsTag: true
    }
});
```

### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.
* `unique` Der Wert dieses Felds muss in dieser Sammlung eindeutig sein.
* `uniqueInArray` Wenn auf `true` gesetzt, darf der Benutzer den Wert dieser
  Eigenschaft nur einmal im übergeordneten
  `ArrayProperty` haben. Funktioniert bei direkten Kind-Eigenschaften oder bei
  Kindern der ersten Ebene eines `MapProperty` (wenn als `.of`-Eigenschaft des
  `ArrayProperty` gesetzt).
* `length` Legt die erforderliche Länge für den String-Wert fest.
* `min` Legt eine Mindestlänge für den String-Wert fest.
* `max` Legt eine Maximallänge für den String-Wert fest.
* `matches` Geben Sie einen beliebigen Regex zum Abgleichen des Werts an.
* `email` Validiert den Wert als E-Mail-Adresse über einen Regex.
* `url` Validiert den Wert als gültige URL über einen Regex.
* `trim` Transformiert String-Werte durch Entfernen von führenden und abschließenden Leerzeichen.
* `lowercase` Transformiert den String-Wert in Kleinbuchstaben.
* `uppercase` Transformiert den String-Wert in Großbuchstaben.

---

Basierend auf Ihrer Konfiguration werden folgende Formular-Widgets erstellt:

- [`TextFieldBinding`](../../api/functions/TextFieldBinding) generisches Textfeld
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) wenn `enumValues`
  in der String-Konfiguration gesetzt sind, rendert dieses Feld eine Auswahl,
  bei der jede Option ein farbiger Chip ist.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding)
  die Eigenschaft hat eine
  Speicherkonfiguration.
- [`MarkdownEditorFieldBinding.`](../../api/functions/MarkdownEditorFieldBinding) die
  Eigenschaft hat eine
  Markdown-Konfiguration.

Links:

- [API](../../api/interfaces/StringProperty)
