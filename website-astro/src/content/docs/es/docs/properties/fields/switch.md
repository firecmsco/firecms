---
title: Interruptor (Switch)
slug: es/docs/properties/fields/switch
---

![Field](/img/fields/Switch.png)

Interruptor (toggle) simple para seleccionar valores `true` o `false`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Seleccionable",
    dataType: "boolean"
});
```

El tipo de datos es [`boolean`](../config/boolean).

Internamente, el componente utilizado
es [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding).
