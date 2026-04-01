---
title: Chave/Valor
slug: pt/docs/properties/fields/key_value
---

![Field](/img/fields/KeyValue.png)

Chave/Valor é um campo especial que permite inserir pares chave/valor arbitrários.
Pode usar strings como chaves e qualquer tipo primitivo como valor (incluindo maps
e arrays).

Para habilitar este widget, simplesmente defina o `dataType` como `map`, e a propriedade `keyValue`
como `true`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "map",
    name: "Key value",
    keyValue: true
});
```

O tipo de dado é [`map`](../config/map).

Internamente o componente usado
é [`KeyValueFieldBinding`](../../api/functions/KeyValueFieldBinding).

