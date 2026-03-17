---
title: Bloque (Block)
---

![Field](/img/fields/Block.png)

Bloque (Block) es un campo especial que le permite crear campos de repetición donde las
entradas son dinámicas. Cada entrada tiene un selector de `type` (tipo) que permite al usuario final
elegir entre diferentes propiedades.

Es útil cuando desea brindar la flexibilidad de crear estructuras de
repetición complejas a los usuarios finales, como entradas de blog.

Este campo permite reordenar sus entradas.

Este componente se puede expandir o contraer de forma predeterminada.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Contenido",
    dataType: "array",
    oneOf: {
        typeField: "type",
        valueField: "value",
        properties: {
            images: {
                dataType: "string",
                name: "Imagen",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            text: {
                dataType: "string",
                name: "Texto",
                markdown: true
            },
            products: {
                name: "Productos",
                dataType: "array",
                of: {
                    dataType: "reference",
                    path: "products",
                    previewProperties: ["name", "main_image"]
                }
            }
        }
    }
});
```

El tipo de datos es [`array`](../config/array).

Internamente, el componente utilizado
es [`BlockFieldBinding`](../../api/functions/BlockFieldBinding).
