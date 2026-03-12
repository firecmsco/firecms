---
slug: it/docs/properties/config/boolean
title: Boolean
sidebar_label: Boolean
description: Configurazione per le proprietà booleane in FireCMS, rese come interruttori a levetta.
---

```tsx
import { buildProperty } from "@firecms/core";

const availableProperty = buildProperty({
    name: "Disponibile",
    dataType: "boolean"
});
```



### `validation`

* `required` Questo campo deve essere obbligatorio.
* `requiredMessage` Messaggio da visualizzare come errore di validazione.

---

Il widget creato è
- [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding) semplice interruttore booleano

Link:
- [API](../../api/interfaces/BooleanProperty)
