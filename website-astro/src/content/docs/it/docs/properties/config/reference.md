---
title: Reference
sidebar_label: Reference
description: Configurazione per le proprietà reference in FireCMS, che collegano entità ad altre collezioni con anteprime e filtri.
---

```tsx
import { buildProperty } from "@firecms/core";

const productsReferenceProperty = buildProperty({
    name: "Prodotto",
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
});
```

### `path`

Percorso assoluto della collezione a cui punta questo reference.
Lo schema dell'entità viene inferito in base alla navigazione radice,
quindi i filtri e il delegato di ricerca presenti vengono applicati anche a questa vista.

### `previewProperties`

Lista delle proprietà rese come anteprima di questo reference.
Default: prime 3.

### `forceFilter`

Forza un filtro nella selezione del reference. Se applicato, il resto dei filtri
sarà disabilitato. I filtri applicati con questa prop non possono essere modificati.
es. `forceFilter: { age: [">=", 18] }`

### `validation`

* `required` Questo campo deve essere obbligatorio.
* `requiredMessage` Messaggio da visualizzare come errore di validazione.

### `includeId`

Il reference deve includere l'ID dell'entità. Default `true`.

### `includeEntityLink`

Il reference deve includere un link all'entità (apre i dettagli dell'entità). Default `true`.

### `defaultValue`

Valore default per questa proprietà.
Puoi impostare il valore default definendo un EntityReference:

```tsx

import { buildProperty, EntityReference } from "@firecms/core";

const productsReferenceProperty = buildProperty({
    name: "Prodotto",
    dataType: "reference",
    path: "products",
    defaultValue: new EntityReference("B000P0MDMS", "products")
});
```

---

Il widget creato è

- [`ReferenceFieldBinding`](../../api/functions/ReferenceFieldBinding) Campo
  che apre un
  dialog di selezione riferimenti

Link:

- [API](../../api/interfaces/ReferenceProperty)
