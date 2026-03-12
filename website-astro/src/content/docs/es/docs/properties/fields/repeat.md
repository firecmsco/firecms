---
slug: es/docs/properties/fields/repeat
title: Repetir (Repeat)
---

![Field](/img/fields/Repeat.png)

Puedes usar un campo de repetición (repeat) cuando deseas guardar múltiples valores en una propiedad.
Por ejemplo, es posible que desees guardar varias piezas de texto, como etiquetas (tags).

Ten en cuenta que si utilizas una propiedad `array` que usa un accesorio (prop) `of`, el
campo resultante puede ser uno de los especializados (como selección (select), carga (upload) de archivos
o campo de referencia). El campo de repetición se utilizará en el resto de los casos.

Este campo permite reordenar sus entradas.

Este componente se puede expandir o contraer de forma predeterminada.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Etiquetas",
    of: {
        dataType: "string",
        previewAsTag: true
    },
    expanded: true,
    sortable: true, // por defecto es true
    canAddElements: true, // por defecto es true
});
```

El tipo de datos es [`array`](../config/array).

Internamente, el componente utilizado
es [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding).
