---
title: Zahl
slug: de/docs/properties/config/number
sidebar_label: Zahl
description: Konfiguration für Zahleneigenschaften in FireCMS, einschließlich Validierung, Enums und Integer-Einschränkungen.
---

```tsx
import { buildProperty } from "@firecms/core";

const rangeProperty = buildProperty({
    name: "Range",
    validation: {
        min: 0,
        max: 3
    },
    dataType: "number"
});
```

### `clearable`
Fügt ein Symbol zum Löschen des Werts hinzu. Standardmäßig `false`.


### `enumValues`
Sie können Enum-Werte angeben, die eine Zuordnung möglicher exklusiver Werte bieten, die die Eigenschaft annehmen kann.

```tsx
import { buildProperty, buildEnumValueConfig } from "@firecms/core";

const property = buildProperty({
    name: "Status",
    dataType: "number",
    enumValues: [
      buildEnumValueConfig({
        id: "-1",
        label: "Lightly tense",
        color: "redLighter"
      }),
      buildEnumValueConfig({
        id: "0",
        label: "Normal",
        color: "grayLight"
      }),
      buildEnumValueConfig({
        id: "1",
        label: "Lightly relaxed",
        color: "blueLighter"
      })
    ]
});
```

### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.
* `min` Legt den minimalen erlaubten Wert fest.
* `max` Legt den maximalen erlaubten Wert fest.
* `lessThan` Wert muss kleiner sein als.
* `moreThan` Wert muss größer sein als.
* `positive` Wert muss eine positive Zahl sein.
* `negative` Wert muss eine negative Zahl sein.
* `integer` Wert muss eine ganze Zahl sein.

---

Links:
- [API](../../api/interfaces/NumberProperty)
