---
title: Key/Value
---

![Field](/img/fields/KeyValue.png)

Key/Value è un campo speciale che ti permette di inserire coppie chiave/valore arbitrarie.
Puoi usare stringhe come chiavi e qualsiasi tipo primitivo come valore (inclusi mappe
e array).

Per abilitare questo widget, imposta semplicemente il `dataType` su `map` e la proprietà `keyValue`
su `true`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "map",
    name: "Chiave valore",
    keyValue: true
});
```

Il tipo di dato è [`map`](../config/map).

Il componente utilizzato internamente
è [`KeyValueFieldBinding`](../../api/functions/KeyValueFieldBinding).
