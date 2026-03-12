---
slug: de/docs/properties/config/reference
title: Referenz
sidebar_label: Referenz
description: Konfiguration für Referenzeigenschaften in FireCMS, die Entities mit anderen Kollektionen verknüpfen.
---

```tsx
import { buildProperty } from "@firecms/core";

const productsReferenceProperty = buildProperty({
    name: "Product",
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
});
```

### `path`

Absoluter Kollektionspfad der Kollektion, auf die diese Referenz zeigt.

### `previewProperties`

Liste der Eigenschaften, die als Vorschau dieser Referenz gerendert werden.
Standardmäßig die ersten 3.

### `forceFilter`

Erzwingen Sie einen Filter in der Referenzauswahl. Falls angewendet, werden die restlichen Filter
deaktiviert.
Beispiel: `forceFilter: { age: [">=", 18] }`

### `validation`

* `required` Soll dieses Feld obligatorisch sein.
* `requiredMessage` Meldung bei Validierungsfehler.

### `includeId`

Soll die Referenz die ID der Entity enthalten? Standardmäßig `true`.

### `includeEntityLink`

Soll die Referenz einen Link zur Entity enthalten? Standardmäßig `true`.

### `defaultValue`

Standardwert für diese Eigenschaft. Sie können den Standardwert mit einer `EntityReference` setzen:

```tsx
import { buildProperty, EntityReference } from "@firecms/core";

const productsReferenceProperty = buildProperty({
    name: "Product",
    dataType: "reference",
    path: "products",
    defaultValue: new EntityReference("B000P0MDMS", "products")
});
```

---

Links:
- [API](../../api/interfaces/ReferenceProperty)
