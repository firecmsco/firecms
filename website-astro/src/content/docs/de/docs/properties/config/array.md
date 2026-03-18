---
title: Array
sidebar_label: Array
description: Konfiguration für Array-Eigenschaften in FireCMS, einschließlich typisierter Arrays, Tupel, Blöcke (oneOf) und Validierung.
---

###  `of`

Die Eigenschaft dieses Arrays.

Sie können jede Eigenschaft angeben (außer einer anderen Array-Eigenschaft, da
Firestore dies nicht unterstützt).
Sie können dieses Feld nur dann leer lassen, wenn Sie ein benutzerdefiniertes Feld bereitstellen oder
ein `oneOf`-Feld angeben, andernfalls wird ein Fehler ausgelöst.

Beispiel einer `of`-Array-Eigenschaft:
```tsx
import { buildProperty } from "@firecms/core";

const productReferences = buildProperty({
  name: "Products",
  dataType: "array",
  of: {
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
  }
});
```

#### Tupel

Sie können auch ein Array von Eigenschaften angeben, um ein Tupel zu definieren:
```tsx
import { buildProperty } from "@firecms/core";

const tupleDates = buildProperty({
  name: "Date Range (Start to End)",
  dataType: "array",
  of: [
    {
      name: "Start Date",
      dataType: "date"
    },
    {
      name: "End Date",
      dataType: "date"
    }
  ]
});
```

### `oneOf`

Verwenden Sie dieses Feld, wenn Sie ein Array von Eigenschaften haben möchten.
Es ist nützlich, wenn Sie Werte verschiedener Typen im selben
Array benötigen.
Jedes Element des Arrays ist ein Objekt mit der Form:
```
{ type: "YOUR_TYPE", value: "YOUR_VALUE"}
```
Beachten Sie, dass Sie jede Eigenschaft verwenden können, sodass `value` jeden Wert annehmen kann (Strings,
Zahlen, Arrays, Objekte...).
Sie können die Felder `type` und `value` nach Ihren Bedürfnissen anpassen.

Ein Beispiel für die Verwendung dieser Funktion kann ein Blogbeitrag sein, bei dem Sie
Bilder und Textblöcke mit Markdown haben.

Beispiel eines `oneOf`-Feldes:
```tsx
import { buildProperty } from "@firecms/core";

const contentProperty = buildProperty({
  name: "Content",
  description: "Example of a complex array with multiple properties as children",
  validation: { required: true },
  dataType: "array",
  oneOf: {
    typeField: "type",
    valueField: "value",
    properties: {
      name: {
        name: "Title",
        dataType: "string"
      },
      text: {
        dataType: "string",
        name: "Text",
        markdown: true
      }
    }
  }
});
```


### `sortable`

Steuert, ob Elemente in diesem Array neu geordnet werden können. Standardmäßig `true`.
Diese Eigenschaft hat keine Auswirkung, wenn `disabled` auf `true` gesetzt ist.

Beispiel:
```tsx
import { buildProperty } from "@firecms/core";

const tagsProperty = buildProperty({
  name: "Tags",
  dataType: "array",
  of: {
    dataType: "string",
    previewAsTag: true
  },
  sortable: false // Neuordnung deaktivieren
});
```

### `canAddElements`

Steuert, ob Elemente zum Array hinzugefügt werden können. Standardmäßig `true`.
Diese Eigenschaft hat keine Auswirkung, wenn `disabled` auf `true` gesetzt ist.

Beispiel:
```tsx
import { buildProperty } from "@firecms/core";

const readOnlyTagsProperty = buildProperty({
  name: "Tags",
  dataType: "array",
  of: {
    dataType: "string"
  },
  canAddElements: false // Hinzufügen neuer Tags verhindern
});
```

### `expanded`

Bestimmt, ob das Feld zunächst aufgeklappt sein soll. Standardmäßig `true`.

### `minimalistView`

Wenn auf `true` gesetzt, werden die Kind-Eigenschaften direkt ohne umschließendes Panel angezeigt.


### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.
* `min` Legt die minimale Länge fest.
* `max` Legt die maximale Länge fest.

---

Basierend auf Ihrer Konfiguration werden folgende Formular-Widgets erstellt:
- [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding) generisches Array-Feld, das Neuordnung ermöglicht und die Kind-Eigenschaft als Knoten rendert.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding) wenn die `of`-Eigenschaft ein `string` mit Speicherkonfiguration ist.
- [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding) wenn die `of`-Eigenschaft eine `reference` ist.
- [`BlockFieldBinding`](../../api/functions/BlockFieldBinding) wenn die `oneOf`-Eigenschaft angegeben ist.

Links:
- [API](../../api/interfaces/ArrayProperty)
