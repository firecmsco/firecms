---
title: Wiederholen
slug: de/docs/properties/fields/repeat
---

![Field](/img/fields/Repeat.png)

Verwenden Sie ein Wiederholungsfeld, wenn Sie mehrere Werte in einer Eigenschaft speichern möchten — zum Beispiel mehrere Tags.

Dieses Feld erlaubt die Neuordnung seiner Einträge.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Tags",
    of: {
        dataType: "string",
        previewAsTag: true
    },
    expanded: true,
    sortable: true,
    canAddElements: true,
});
```

Der Datentyp ist [`array`](../config/array).
