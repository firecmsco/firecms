---
title: String
sidebar_label: String
description: Konfiguration für String-Eigenschaften in FireCMS, einschließlich Validierung, Enums, URL, E-Mail und mehr.
---

String-Eigenschaften unterstützen Text, URLs, E-Mails, Enums, Markdown und Datei-Uploads.

```tsx
import { buildProperty } from "@firecms/core";

const nameProperty = buildProperty({
    name: "Name",
    dataType: "string",
    validation: { required: true }
});
```

### `url`

Gibt an, dass dieser String eine **URL** darstellt. Der Wert wird als anklickbarer Link gerendert.

```tsx
import { buildProperty } from "@firecms/core";

const urlProperty = buildProperty({
    name: "Link",
    dataType: "string",
    url: true
});
```

### `email`

Gibt an, dass dieser String eine **E-Mail-Adresse** darstellt.

```tsx
import { buildProperty } from "@firecms/core";

const emailProperty = buildProperty({
    name: "Email",
    dataType: "string",
    email: true
});
```

### `userSelect`

Diese Eigenschaft gibt an, dass der String eine **Benutzer-ID** ist und als Benutzerauswahl gerendert wird.

```tsx
import { buildProperty } from "@firecms/core";

const assignedUserProperty = buildProperty({
    name: "Assigned User",
    dataType: "string",
    userSelect: true
});
```

### `enumValues`

Definiert eine Reihe möglicher exklusiver Werte (als Dropdown-Auswahl gerendert).

```tsx
import { buildProperty } from "@firecms/core";

const languageProperty = buildProperty({
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

Ist diese String-Eigenschaft lang genug, um in einem mehrzeiligen Feld angezeigt zu werden? Standardmäßig false.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    name: "Description",
    dataType: "string",
    multiline: true
});
```

### `clearable`

Fügt ein Symbol zum Löschen des Werts hinzu. Standardmäßig `false`.

### `markdown`

Soll diese String-Eigenschaft als Markdown-Feld angezeigt werden?

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    dataType: "string",
    name: "Text",
    markdown: true
});
```

### `previewAsTag`

Soll dieser String als Tag anstatt als Text gerendert werden?

### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.
* `unique` Der Wert dieses Felds muss in dieser Kollektion eindeutig sein.
* `uniqueInArray` Wenn auf `true` gesetzt, darf der Wert nur einmal im übergeordneten `ArrayProperty` vorkommen.
* `length` Legt die erforderliche Länge für den String-Wert fest.
* `min` Legt eine Mindestlänge fest.
* `max` Legt eine Maximallänge fest.
* `matches` Regex zum Abgleichen des Werts.
* `email` Validiert als E-Mail-Adresse.
* `url` Validiert als gültige URL.
* `trim` Entfernt führende und abschließende Leerzeichen.
* `lowercase` Konvertiert in Kleinbuchstaben.
* `uppercase` Konvertiert in Großbuchstaben.

---

Links:
- [API](../../api/interfaces/StringProperty)
