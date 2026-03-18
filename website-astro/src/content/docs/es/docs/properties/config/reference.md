---
title: Reference
slug: es/docs/properties/config/reference
sidebar_label: Reference
description: Configuración de propiedades de referencia en FireCMS, enlazando entidades a otras colecciones con previsualizaciones y filtros.
---

```tsx
import { buildProperty } from "@firecms/core";

const productsReferenceProperty = buildProperty({
    name: "Product",
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
});
```

### `path`

Ruta absoluta de la colección a la que apunta esta referencia. El esquema de la entidad se infiere basándose en la navegación raíz,
por lo que los filtros y el delegado de búsqueda existentes allí se aplican a esta vista también.

### `previewProperties`

Lista de propiedades renderizadas como previsualización de esta referencia.
Por defecto las primeras 3.

### `forceFilter`

Forzar un filtro en la selección de referencia. Si se aplica, el resto de los filtros
serán deshabilitados. Los filtros aplicados con esta prop no pueden ser cambiados.
ej. `forceFilter: { age: [">=", 18] }`

### `validation`

* `required` Si este campo debe ser obligatorio.
* `requiredMessage` Mensaje a mostrar como error de validación.

### `includeId`

Si la referencia debe incluir el ID de la entidad. Por defecto es `true`.

### `includeEntityLink`

Si la referencia debe incluir un enlace a la entidad (abrir los detalles de la entidad). Por defecto es `true`.

### `defaultValue`

Valor por defecto para esta propiedad.
Puedes establecer el valor por defecto definiendo un EntityReference:

```tsx

import { buildProperty, EntityReference } from "@firecms/core";

const productsReferenceProperty = buildProperty({
    name: "Product",
    dataType: "reference",
    path: "products",
    defaultValue: new EntityReference("B000P0MDMS", "products")
});
```

---

El widget que se crea es

- [`ReferenceFieldBinding`](../../api/functions/ReferenceFieldBinding) Campo
  que abre un
  diálogo de selección de referencia

Enlaces:

- [API](../../api/interfaces/ReferenceProperty)
