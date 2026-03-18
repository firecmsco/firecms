---
title: Datum/Uhrzeit
slug: de/docs/properties/config/date
sidebar_label: Datum/Uhrzeit
description: Konfiguration für Datum- und Zeiteigenschaften in FireCMS, einschließlich automatischer Werte, Datumsmodi und Validierung.
---

```tsx
import { buildProperty } from "@firecms/core";

const publicationProperty = buildProperty({
    name: "Publication date",
    dataType: "date"
});
```

### `autoValue` "on_create" | "on_update"

Verwenden Sie diese Eigenschaft, um dieses Datum automatisch beim Erstellen oder Aktualisieren einer Entity zu setzen.

### `mode` "date" | "date_time"

Legen Sie die Granularität des Felds auf Datum oder Datum + Uhrzeit fest.
Standardmäßig `date_time`.

### `clearable`
Fügt ein Symbol zum Löschen des Werts hinzu. Standardmäßig `false`.

### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.
* `min` Legt das minimale erlaubte Datum fest.
* `max` Legt das maximale erlaubte Datum fest.

---

Links:
- [API](../../api/interfaces/DateProperty)
