---
title: Gruppe
---

![Field](/img/fields/Group.png)

Verwenden Sie dieses Feld, um andere Gruppen in einer einzigen darzustellen, die durch ein aufklapt-bares Panel repräsentiert wird.
Dies ist nützlich, um Daten in logische Felder zusammenzufassen.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Address",
    dataType: "map",
    properties: {
        street: {
            name: "Street",
            dataType: "string"
        },
        postal_code: {
            name: "Postal code",
            dataType: "number"
        }
    },
    expanded: true
});
```

Der Datentyp ist [`map`](../config/map).
