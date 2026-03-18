---
title: Repeat
slug: it/docs/properties/fields/repeat
---

![Field](/img/fields/Repeat.png)

Puoi usare un campo repeat quando vuoi salvare più valori in una proprietà.
Per esempio, potresti voler salvare più pezzi di testo, come dei tag.

Nota che se usi una proprietà `array` con una prop `of`, il campo
risultante potrebbe essere uno di quelli specializzati (come select, caricamento file
o campo reference). Il campo repeat verrà usato negli altri casi.

Questo campo permette il riordino delle voci.

Questo componente può essere espanso o compresso per default.

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
    sortable: true, // default è true
    canAddElements: true, // default è true
});
```

Il tipo di dato è [`array`](../config/array).

Il componente utilizzato internamente
è [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding).
