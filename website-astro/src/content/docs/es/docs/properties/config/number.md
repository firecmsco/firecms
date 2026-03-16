---
slug: es/docs/properties/config/number
title: Number
sidebar_label: Number
description: Configuración de propiedades numéricas en FireCMS, incluyendo validación, enums y restricciones de enteros.
---

```tsx
import { buildProperty } from "@firecms/core";

const rangeProperty = buildProperty({
    name: "Range",
    validation: {
        min: 0,
        max: 3
    },
    dataType: "number"
});
```

### `clearable`
Agrega un icono para limpiar el valor y establecerlo en `null`. Por defecto es `false`


### `enumValues`
Puedes usar los valores enum proporcionando un mapa de posibles
  valores exclusivos que la propiedad puede tomar, mapeados a la etiqueta que se
  muestra en el dropdown.


```tsx
import { buildProperty, buildEnumValueConfig } from "@firecms/core";

const property = buildProperty({
    name: "Status",
    dataType: "number",
    enumValues: [
      buildEnumValueConfig({
        id: "-1",
        label: "Lightly tense",
        color: "redLighter"
      }),
      buildEnumValueConfig({
        id: "0",
        label: "Normal",
        color: "grayLight"
      }),
      buildEnumValueConfig({
        id: "1",
        label: "Lightly relaxed",
        color: "blueLighter"
      })
    ]
});
```

### `validation`

* `required` Si este campo debe ser obligatorio.
* `requiredMessage` Mensaje a mostrar como error de validación.
* `min` Establecer el valor mínimo permitido.
* `max` Establecer el valor máximo permitido.
* `lessThan` El valor debe ser menor que.
* `moreThan` El valor debe ser mayor que.
* `positive` El valor debe ser un número positivo.
* `negative` El valor debe ser un número negativo.
* `integer` El valor debe ser un entero.


---

Los widgets que se crean son
- [`TextFieldBinding`](../../api/functions/TextFieldBinding) campo de texto genérico
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) si se establecen `enumValues` en la configuración del string, este campo renderiza un select
  donde cada opción es un chip coloreado.

Enlaces:
- [API](../../api/interfaces/NumberProperty)
