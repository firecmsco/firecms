---
title: Campos de fecha/hora (Date/time)
slug: es/docs/properties/fields/date_time
---

Usa los campos de fecha/hora para permitir a los usuarios establecer fechas, guardadas como marcas de tiempo (timestamps) de Firestore.

Puedes elegir entre usar campos de fechas o de fecha/hora. 
También puedes crear campos de solo lectura que se actualizan automáticamente cuando 
se crean o actualizan entidades.

El tipo de datos es [`date`](../config/date).

Internamente, el componente utilizado
es [`DateTimeFieldBinding`](../../api/functions/DateTimeFieldBinding).

#### Campo de fecha

![Field](/img/fields/Date.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Fecha de caducidad",
    mode: "date"
});
```

#### Campo de fecha/hora

![Field](/img/fields/Date_time.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Hora de llegada",
    mode: "date_time"
});
```

#### Actualizar al crear

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Creado el",
    autoValue: "on_create"
});
```

#### Actualizar al modificar

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Actualizado el",
    autoValue: "on_update"
});
```
