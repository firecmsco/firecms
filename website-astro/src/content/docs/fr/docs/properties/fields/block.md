---
title: Bloc (Block)
slug: fr/docs/properties/fields/block
---

![Field](/img/fields/Block.png)

Bloc est un champ spécial qui vous permet de construire des champs de répétition où les entrées sont dynamiques. Chaque entrée a un sélecteur de `type` qui permet à l'utilisateur final de choisir parmi différentes propriétés.

C'est utile lorsque vous souhaitez donner la flexibilité de construire des structures de répétition complexes aux utilisateurs finaux, comme des articles de blog.

Ce champ permet la réorganisation de ses entrées.

Ce composant peut être développé ou réduit par défaut.

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

Le type de données est [`array`](../config/array).

En interne, le composant utilisé est [`BlockFieldBinding`](../../api/functions/BlockFieldBinding).
