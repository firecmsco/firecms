---
title: Array
sidebar_label: Array
description: Konfiguration für Array-Eigenschaften in FireCMS, einschließlich typisierter Arrays, Tupel, Blöcke (oneOf) und Validierung.
---

### `of`

Die Eigenschaft dieses Arrays.

Sie können jede Eigenschaft angeben (außer einer anderen Array-Eigenschaft, da
Firestore dies nicht unterstützt).

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

Verwenden Sie dieses Feld, wenn Sie ein Array mit Eigenschaften verschiedener Typen haben möchten.
Jedes Element des Arrays ist ein Objekt mit der Form:
```
{ type: "YOUR_TYPE", value: "YOUR_VALUE"}
```

Beispiel einer `oneOf`-Eigenschaft:
```tsx
import { buildProperty } from "@firecms/core";

const contentProperty = buildProperty({
  name: "Content",
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

Bestimmt, ob Elemente im Array neu geordnet werden können. Standardmäßig `true`.

### `canAddElements`

Bestimmt, ob Elemente zum Array hinzugefügt werden können. Standardmäßig `true`.

### `expanded`

Bestimmt, ob das Feld zunächst aufgeklappt sein soll. Standardmäßig `true`.

### `minimalistView`

Wenn auf `true` gesetzt, werden die Kindelemente direkt ohne Wrapper-Panel angezeigt.

### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.
* `min` Legt die minimale Länge fest.
* `max` Legt die maximale Länge fest.

---

Links:
- [API](../../api/interfaces/ArrayProperty)
