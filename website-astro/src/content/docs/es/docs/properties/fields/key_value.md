---
title: Clave/Valor (Key/Value)
---

![Field](/img/fields/KeyValue.png)

Clave/Valor (Key/Value) es un campo especial que te permite ingresar pares clave/valor arbitrarios.
Puedes usar cadenas (strings) como claves y cualquier tipo primitivo como valor (incluidos mapas
y arrays).

Para habilitar este widget, simplemente establece el `dataType` (tipo de datos) en `map`, y la propiedad `keyValue`
en `true`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "map",
    name: "Valor clave",
    keyValue: true
});
```

El tipo de datos es [`map`](../config/map).

Internamente, el componente utilizado
es [`KeyValueFieldBinding`](../../api/functions/KeyValueFieldBinding).
