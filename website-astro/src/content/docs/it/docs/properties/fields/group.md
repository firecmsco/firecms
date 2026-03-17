---
title: Group
---

![Field](/img/fields/Group.png)

Usa questo campo per raggruppare altre proprietà in uno solo, rappresentato da un
pannello espandibile. È utile per raggruppare dati in campi logici,
sia dalla prospettiva UX che del modello di dati.

I campi group possono essere espansi o compressi per default.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Indirizzo",
    dataType: "map",
    properties: {
        street: {
            name: "Via",
            dataType: "string"
        },
        postal_code: {
            name: "CAP",
            dataType: "number"
        }
    },
    expanded: true
});
```

Il tipo di dato è [`map`](../config/map).

Il componente utilizzato internamente
è [`MapFieldBinding`](../../api/functions/MapFieldBinding).
