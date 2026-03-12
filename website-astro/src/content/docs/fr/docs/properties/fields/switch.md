---
slug: fr/docs/properties/fields/switch
title: Interrupteur (Switch)
---

![Field](/img/fields/Switch.png)

Interrupteur simple pour sélectionner les valeurs `true` ou `false`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Selectable",
    dataType: "boolean"
});
```

Le type de données est [`boolean`](../config/boolean).

En interne, le composant utilisé est [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding).
