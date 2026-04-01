---
title: Schalter
slug: de/docs/properties/fields/switch
---

![Field](/img/fields/Switch.png)

Einfaches Umschalten für die Auswahl von `true`- oder `false`-Werten.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Selectable",
    dataType: "boolean"
});
```

Der Datentyp ist [`boolean`](../config/boolean).
