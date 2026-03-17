---
title: Repeat
---

![Field](/img/fields/Repeat.png)

Pode usar um campo de repetição quando deseja salvar múltiplos valores em uma propriedade.
Por exemplo, pode querer salvar múltiplos pedaços de texto, como tags.

Note que se usar uma propriedade `array` que usa uma prop `of`, o
campo resultante pode ser um dos especializados (como select, upload de arquivo
ou campo de referência). O campo de repetição será usado nos restantes casos.

Este campo permite reordenar suas entradas.

Este componente pode ser expandido ou recolhido por padrão.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Tags",
    of: {
        dataType: "string",
        previewAsTag: true
    },
    expanded: true,
    sortable: true, // padrão é true
    canAddElements: true, // padrão é true
});
```

O tipo de dado é [`array`](../config/array).

Internamente o componente usado
é [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding).

