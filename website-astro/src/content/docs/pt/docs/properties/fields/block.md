---
title: Block
slug: pt/docs/properties/fields/block
---

![Field](/img/fields/Block.png)

Block é um campo especial que permite construir campos de repetição onde as
entradas são dinâmicas. Cada entrada tem um seletor de `type` que permite ao utilizador final
escolher entre diferentes propriedades.

É útil quando deseja dar a flexibilidade de construir estruturas de repetição
complexas aos utilizadores finais, como entradas de blog.

Este campo permite reordenar suas entradas.

Este componente pode ser expandido ou recolhido por padrão.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Content",
    dataType: "array",
    oneOf: {
        typeField: "type",
        valueField: "value",
        properties: {
            images: {
                dataType: "string",
                name: "Image",
                storage: {
                    storagePath: "images",
                    acceptedFiles: ["image/*"]
                }
            },
            text: {
                dataType: "string",
                name: "Text",
                markdown: true
            },
            products: {
                name: "Products",
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

O tipo de dado é [`array`](../config/array).

Internamente o componente usado
é [`BlockFieldBinding`](../../api/functions/BlockFieldBinding).

