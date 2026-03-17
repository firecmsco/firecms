---
title: Grupo (Group)
---

![Field](/img/fields/Group.png)

Usa este campo para agrupar otros grupos en uno solo, representado por un
panel expandible. Esto es útil para agrupar datos en campos lógicos,
tanto desde la perspectiva de la interfaz de usuario (UX) como del modelo de datos.

Los campos de grupo pueden estar expandidos o contraídos inicialmente de forma predeterminada.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Dirección",
    dataType: "map",
    properties: {
        street: {
            name: "Calle",
            dataType: "string"
        },
        postal_code: {
            name: "Código postal",
            dataType: "number"
        }
    },
    expanded: true
});
```

El tipo de datos es [`map`](../config/map).

Internamente, el componente utilizado
es [`MapFieldBinding`](../../api/functions/MapFieldBinding).
