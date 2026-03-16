---
slug: es/docs/properties/config/boolean
title: Boolean
sidebar_label: Boolean
description: Configuración de propiedades booleanas en FireCMS, renderizadas como interruptores toggle.
---

```tsx
import { buildProperty } from "@firecms/core";

const availableProperty = buildProperty({
    name: "Available",
    dataType: "boolean"
});
```



### `validation`

* `required` Si este campo debe ser obligatorio.
* `requiredMessage` Mensaje a mostrar como error de validación.

---

El widget que se crea es
- [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding)  interruptor booleano simple

Enlaces:
- [API](../../api/interfaces/BooleanProperty)
