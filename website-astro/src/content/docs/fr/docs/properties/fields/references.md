---
slug: fr/docs/properties/fields/references
title: Références (References)
---

Utilisez des champs de référence lorsque vous devez établir des relations entre collections. Par exemple, vous pouvez avoir un produit qui est lié à une catégorie, ou un qui a plusieurs achats.

Lorsque vous configurez une application FireCMS, vous définissez des collections sous des chemins (ou des alias de chemins), et ce sont ces chemins que vous utilisez pour configurer les propriétés de référence.

### Champ de référence unique

![Field](/img/fields/Reference.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "reference",
    path: "users",
    name: "Related client",
});
```

Le type de données est [`reference`](../config/reference).

En interne, le composant utilisé est [`ReferenceFieldBinding`](../../api/functions/ReferenceFieldBinding).


### Champ de références multiples

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

Le type de données est [`array`](../config/array) avec une propriété de référence comme prop `of`.

En interne, le composant utilisé est [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding).
