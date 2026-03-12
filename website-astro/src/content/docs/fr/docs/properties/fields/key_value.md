---
slug: fr/docs/properties/fields/key_value
title: Clé/Valeur (Key/Value)
---

![Field](/img/fields/KeyValue.png)

Clé/Valeur est un champ spécial qui vous permet de saisir des paires clé/valeur arbitraires. Vous pouvez utiliser des chaînes comme clés et n'importe quel type primitif comme valeur (y compris les maps et les tableaux).

Pour activer ce widget, définissez simplement le `dataType` à `map` et la propriété `keyValue` à `true`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "map",
    name: "Key value",
    keyValue: true
});
```

Le type de données est [`map`](../config/map).

En interne, le composant utilisé est [`KeyValueFieldBinding`](../../api/functions/KeyValueFieldBinding).
