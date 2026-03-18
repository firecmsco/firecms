---
title: Map
sidebar_label: Map
description: Konfiguration für Map-Eigenschaften (verschachtelte Objekte) in FireCMS, einschließlich Kind-Eigenschaften, Vorschauen und Schlüssel-Wert-Modus.
---

In einer Map-Eigenschaft definieren Sie Kind-Eigenschaften auf die gleiche Weise wie auf
der Ebene des Entity-Schemas:

```tsx
import { buildProperty } from "@firecms/core";

const ctaProperty = buildProperty({
    dataType: "map",
    properties: {
        name: {
            name: "Name",
            description: "Text that will be shown on the button",
            validation: { required: true },
            dataType: "string"
        },
        type: {
            name: "Type",
            description: "Action type that determines the user flow",
            validation: { required: true, uniqueInArray: true },
            dataType: "string",
            enumValues: {
                complete: "Complete",
                continue: "Continue"
            }
        }
    }
});
```

###  `properties`
Verzeichnis der in dieser Map enthaltenen Eigenschaften.

### `previewProperties`
Liste der Eigenschaften, die als Vorschau dieser Map gerendert werden. Standardmäßig die ersten 3.

### `spreadChildren`
Zeigt die Kind-Eigenschaften als unabhängige Spalten in der Sammlungsansicht an. Standardmäßig `false`.

### `pickOnlySomeKeys`

Ermöglicht dem Benutzer, nur einige Schlüssel in dieser Map hinzuzufügen.
Standardmäßig haben alle Eigenschaften der Map das entsprechende Feld in
der Formularansicht. Wenn dieses Flag auf true gesetzt wird, können nur einige ausgewählt werden.
Nützlich für Maps, die viele Untereigenschaften haben können, die möglicherweise nicht
benötigt werden.

### `expanded`

Bestimmt, ob das Feld zunächst aufgeklappt sein soll. Standardmäßig `true`.

### `keyValue`

Rendert diese Map als Schlüssel-Wert-Tabelle, die die Verwendung
beliebiger Schlüssel ermöglicht. Sie müssen in diesem Fall keine Eigenschaften definieren.

### `minimalistView`

Wenn auf `true` gesetzt, werden die Kind-Eigenschaften direkt ohne umschließendes Panel angezeigt.

### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.

---

Das erstellte Widget ist
- [`MapFieldBinding`](../../api/functions/MapFieldBinding) Feld, das die Kind-Eigenschaftsfelder rendert

Links:
- [API](../../api/interfaces/MapProperty)
