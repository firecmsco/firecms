---
slug: pt/docs/properties/fields/group
title: Group
---

![Field](/img/fields/Group.png)

Use este campo para agrupar outros campos em um único, representado por um
painel expansível. Isto é útil para agrupar dados em campos lógicos,
tanto da perspetiva UX quanto do modelo de dados.

Campos de grupo podem ser inicialmente expandidos ou recolhidos por padrão.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Address",
    dataType: "map",
    properties: {
        street: {
            name: "Street",
            dataType: "string"
        },
        postal_code: {
            name: "Postal code",
            dataType: "number"
        }
    },
    expanded: true
});
```

O tipo de dado é [`map`](../config/map).

Internamente o componente usado
é [`MapFieldBinding`](../../api/functions/MapFieldBinding).

