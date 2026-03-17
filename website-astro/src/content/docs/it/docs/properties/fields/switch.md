---
title: Switch
---

![Field](/img/fields/Switch.png)

Semplice interruttore per selezionare i valori `true` o `false`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Selezionabile",
    dataType: "boolean"
});
```

Il tipo di dato è [`boolean`](../config/boolean).

Il componente utilizzato internamente
è [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding).
