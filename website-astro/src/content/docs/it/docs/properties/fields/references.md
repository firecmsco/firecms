---
title: References
slug: it/docs/properties/fields/references
---

Usa i campi reference quando hai bisogno di stabilire relazioni tra collezioni.
Per esempio, potresti avere un prodotto correlato a una categoria, o uno
con più acquisti.

Quando configuri un'app FireCMS, definisci le collezioni sotto percorsi (o alias di percorso),
e quelli sono i percorsi che usi per configurare le proprietà reference.

### Campo reference singolo

![Field](/img/fields/Reference.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "reference",
    path: "users",
    name: "Cliente correlato",
});
```

Il tipo di dato è [`reference`](../config/reference)

Il componente utilizzato internamente
è [`ReferenceFieldBinding`](../../api/functions/ReferenceFieldBinding).


### Campo riferimento multiplo

![Field](/img/fields/Multi_reference.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Prodotti correlati",
    of: {
        dataType: "reference",
        path: "products"
    }
});
```

Il tipo di dato è [`array`](../config/array) con una proprietà reference
come prop `of`.

Il componente utilizzato internamente
è [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding).
