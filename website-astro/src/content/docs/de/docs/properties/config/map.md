---
slug: de/docs/properties/config/map
title: Map
sidebar_label: Map
description: Konfiguration für Map-Eigenschaften in FireCMS, einschließlich Unterfelder und Layoutoptionen.
---

```tsx
import { buildProperty } from "@firecms/core";

const publisherProperty = buildProperty({
    name: "Publisher",
    description: "This is an object",
    dataType: "map",
    properties: {
        name: {
            name: "Name",
            dataType: "string"
        },
        external_id: {
            name: "External id",
            dataType: "string"
        }
    }
});
```

### `properties`

Eigenschaften der Map-Eigenschaft.

### `previewProperties`

Liste der Eigenschaften, die in der Vorschau angezeigt werden. Standardmäßig werden die ersten 3 Eigenschaften angezeigt.

### `expanded`

Soll dieses Feld zunächst aufgeklappt sein? Standardmäßig `true`.

### `minimalistView`

Wenn auf `true` gesetzt, werden die Kindelemente direkt ohne Wrapper-Panel angezeigt.

### `layout`

Layout der Map-Felder: `"row"` oder `"column"`.

### `keyValue`

Wenn auf `true` gesetzt, ermöglicht diese Map beliebige Schlüssel-Wert-Paare.
Dies ist nützlich, wenn die Schlüssel nicht bekannt sind.

```tsx
import { buildProperty } from "@firecms/core";

const translationsProperty = buildProperty({
    name: "Translations",
    dataType: "map",
    keyValue: true
});
```

### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.

---

Links:
- [API](../../api/interfaces/MapProperty)
