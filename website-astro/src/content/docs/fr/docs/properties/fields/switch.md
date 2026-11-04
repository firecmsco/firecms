---
title: Interrupteur (Switch)
slug: fr/docs/properties/fields/switch
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

Le type de données est [`boolean`](/fr/docs/properties/config/boolean).

En interne, le composant utilisé est [`SwitchFieldBinding`](/fr/docs/api/functions/SwitchFieldBinding).
