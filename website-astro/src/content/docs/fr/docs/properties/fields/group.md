---
title: Groupe (Group)
slug: fr/docs/properties/fields/group
---

![Field](/img/fields/Group.png)

Utilisez ce champ pour regrouper d'autres groupes en un seul, représenté par un panneau extensible. C'est utile pour regrouper des données en champs logiques, à la fois du point de vue de l'UX et du modèle de données.

Les champs de groupe peuvent être initialement développés ou réduits par défaut.

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

Le type de données est [`map`](../config/map).

En interne, le composant utilisé est [`MapFieldBinding`](../../api/functions/MapFieldBinding).
