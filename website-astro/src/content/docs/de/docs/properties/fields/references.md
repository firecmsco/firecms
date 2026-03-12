---
slug: de/docs/properties/fields/references
title: Referenzen
---

Verwenden Sie Referenzfelder, wenn Sie Beziehungen zwischen Kollektionen herstellen müssen.
Beispielsweise kann ein Produkt einer Kategorie zugeordnet sein, oder
mehrere Käufe haben.

### Einzelnes Referenzfeld

![Field](/img/fields/Reference.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "reference",
    path: "users",
    name: "Related client",
});
```

### Mehrfaches Referenzfeld

![Field](/img/fields/Multi_reference.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Related products",
    of: {
        dataType: "reference",
        path: "products"
    }
});
```
