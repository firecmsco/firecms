---
title: Campos de data/hora
slug: pt/docs/properties/fields/date_time
---

Use os campos de data/hora para permitir que os utilizadores definam datas, salvas como timestamps do Firestore.

Pode escolher entre usar campos de data ou data/hora.
Também pode criar campos somente leitura que são atualizados automaticamente quando
entidades são criadas ou atualizadas.

O tipo de dado é [`date`](../config/date).

Internamente o componente usado
é [`DateTimeFieldBinding`](../../api/functions/DateTimeFieldBinding).

#### Campo de data

![Field](/img/fields/Date.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Expiry date",
    mode: "date"
});
```

#### Campo de data/hora

![Field](/img/fields/Date_time.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Arrival time",
    mode: "date_time"
});
```

#### Atualizar na criação

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Created at",
    autoValue: "on_create"
});
```

#### Atualizar na atualização

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Updated at",
    autoValue: "on_update"
});
```
