---
title: Map
slug: es/docs/properties/config/map
sidebar_label: Map
description: Configuración de propiedades de tipo map (objetos anidados) en FireCMS, incluyendo propiedades hijas, previsualizaciones y modo clave-valor.
---

En una propiedad map defines propiedades hijas de la misma manera que las defines
a nivel del esquema de entidad:

```tsx
import { buildProperty } from "@firecms/core";

const ctaProperty = buildProperty({
    dataType: "map",
    properties: {
        name: {
            name: "Name",
            description: "Text that will be shown on the button",
            validation: { required: true },
            dataType: "string"
        },
        type: {
            name: "Type",
            description: "Action type that determines the user flow",
            validation: { required: true, uniqueInArray: true },
            dataType: "string",
            enumValues: {
                complete: "Complete",
                continue: "Continue"
            }
        }
    }
});
```

###  `properties`
Registro de propiedades incluidas en este map.

### `previewProperties`
Lista de propiedades renderizadas como previsualización de este map. Por defecto las primeras 3.

### `spreadChildren`
Muestra las propiedades hijas como columnas independientes en la vista
de colección. Por defecto es `false`.

### `pickOnlySomeKeys`

Permite al usuario agregar solo algunas claves en este map.
Por defecto, todas las propiedades del map tienen el campo correspondiente en
la vista de formulario. Establecer este flag en true permite seleccionar solo algunas.
Útil para maps que pueden tener muchas sub-propiedades que pueden no ser
necesarias.

### `expanded`

Determina si el campo debe estar inicialmente expandido. Por defecto es `true`.

### `keyValue`

Renderiza este map como una tabla clave-valor que permite usar
claves arbitrarias. No necesitas definir las propiedades en este caso.

### `minimalistView`

Cuando se establece en `true`, muestra las propiedades hijas directamente sin estar envueltas en un panel expandible.

### `validation`

* `required` Si este campo debe ser obligatorio.
* `requiredMessage` Mensaje a mostrar como error de validación.

---

El widget que se crea es
- [`MapFieldBinding`](../../api/functions/MapFieldBinding) Campo que renderiza los campos
  de propiedades hijas

Enlaces:
- [API](../../api/interfaces/MapProperty)
