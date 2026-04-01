---
title: Switch
slug: pt/docs/properties/fields/switch
---

![Field](/img/fields/Switch.png)

Toggle simples para selecionar valores `true` ou `false`.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    name: "Selectable",
    dataType: "boolean"
});
```

O tipo de dado é [`boolean`](../config/boolean).

Internamente o componente usado
é [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding).

