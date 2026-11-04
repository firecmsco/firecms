---
title: Fecha/Hora
slug: es/docs/properties/config/date
sidebar_label: Fecha/Hora
description: Configuración de propiedades de fecha y hora en FireCMS, incluyendo auto-valores, modos de fecha y validación.
---

```tsx
import { buildProperty } from "@firecms/core";

const publicationProperty = buildProperty({
    name: "Publication date",
    dataType: "date"
});
```
### `autoValue` "on_create" | "on_update"

Usa esta prop para actualizar esta fecha automáticamente al crear
o actualizar una entidad.

### `mode` "date" | "date_time"

Establece la granularidad del campo a una fecha, o fecha + hora.
Por defecto es `date_time`.

### `clearable`
Agrega un icono para limpiar el valor y establecerlo en `null`. Por defecto es `false`

### `validation`

* `required` Si este campo debe ser obligatorio.
* `requiredMessage` Mensaje a mostrar como error de validación.
* `min` Establecer la fecha mínima permitida.
* `max` Establecer la fecha máxima permitida.

---

El widget que se crea es
- [`DateTimeFieldBinding`](/es/docs/api/functions/DateTimeFieldBinding) Campo que permite seleccionar una fecha

Enlaces:
- [API](/es/docs/api/interfaces/DateProperty)
