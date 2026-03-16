---
slug: es/docs/properties/config/array
title: Array
sidebar_label: Array
description: Configuración de propiedades de tipo array en FireCMS, incluyendo arrays tipados, tuplas, bloques (oneOf) y validación.
---

###  `of`

La propiedad de este array.

Puedes especificar cualquier propiedad (excepto otra propiedad Array, ya que
Firestore no lo soporta).
Puedes dejar este campo vacío solo si proporcionas un campo personalizado o
proporcionas un campo `oneOf`, de lo contrario se lanzará un error.

Ejemplo de propiedad array `of`:
```tsx
import { buildProperty } from "@firecms/core";

const productReferences = buildProperty({
  name: "Products",
  dataType: "array",
  of: {
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
  }
});
```

#### tupla

También puedes especificar un array de propiedades para definir una tupla:
```tsx
import { buildProperty } from "@firecms/core";

const tupleDates = buildProperty({
  name: "Date Range (Start to End)",
  dataType: "array",
  of: [
    {
      name: "Start Date",
      dataType: "date"
    },
    {
      name: "End Date",
      dataType: "date"
    }
  ]
});
```

### `oneOf`

Usa este campo si deseas tener un array de propiedades.
Es útil si necesitas tener valores de diferentes tipos en el mismo
array.
Cada entrada del array es un objeto con la forma:
```
{ type: "YOUR_TYPE", value: "YOUR_VALUE"}
```
Ten en cuenta que puedes usar cualquier propiedad, por lo que `value` puede tomar cualquier valor (strings,
números, arrays, objetos...)
Puedes personalizar los campos `type` y `value` según tus necesidades.

Un ejemplo de uso de esta funcionalidad puede ser una entrada de blog, donde tienes
imágenes y bloques de texto usando markdown.

Ejemplo de campo `oneOf`:
```tsx
import { buildProperty } from "@firecms/core";

const contentProperty = buildProperty({
  name: "Content",
  description: "Example of a complex array with multiple properties as children",
  validation: { required: true },
  dataType: "array",
  oneOf: {
    typeField: "type",
    valueField: "value",
    properties: {
      name: {
        name: "Title",
        dataType: "string"
      },
      text: {
        dataType: "string",
        name: "Text",
        markdown: true
      }
    }
  }
});
```


### `sortable`

Controla si los elementos de este array pueden ser reordenados. Por defecto es `true`.
Esta propiedad no tiene efecto si `disabled` está configurado como `true`.

Ejemplo:
```tsx
import { buildProperty } from "@firecms/core";

const tagsProperty = buildProperty({
  name: "Tags",
  dataType: "array",
  of: {
    dataType: "string",
    previewAsTag: true
  },
  sortable: false // deshabilitar reordenamiento
});
```

### `canAddElements`

Controla si se pueden agregar elementos al array. Por defecto es `true`.
Esta propiedad no tiene efecto si `disabled` está configurado como `true`.

Ejemplo:
```tsx
import { buildProperty } from "@firecms/core";

const readOnlyTagsProperty = buildProperty({
  name: "Tags",
  dataType: "array",
  of: {
    dataType: "string"
  },
  canAddElements: false // evitar agregar nuevos tags
});
```

### `expanded`

Determina si el campo debe estar inicialmente expandido. Por defecto es `true`.

### `minimalistView`

Cuando se establece en `true`, muestra las propiedades hijas directamente sin estar envueltas en un panel expandible.


### `validation`

* `required` Si este campo debe ser obligatorio.
* `requiredMessage` Mensaje a mostrar como error de validación.
* `min` Establecer la longitud mínima permitida.
* `max` Establecer la longitud máxima permitida.

---

Según tu configuración, los widgets de campo de formulario que se crean son:
- [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding) campo de array genérico que permite reordenar y renderiza
  la propiedad hija como nodos.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding) si la propiedad `of` es un `string` con configuración de almacenamiento.
- [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding) si la propiedad `of` es una `reference`
- [`BlockFieldBinding`](../../api/functions/BlockFieldBinding) si la propiedad `oneOf` está especificada

Enlaces:
- [API](../../api/interfaces/ArrayProperty)
