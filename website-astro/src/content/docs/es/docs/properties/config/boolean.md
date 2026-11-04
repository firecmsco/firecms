---
title: Boolean
slug: es/docs/properties/config/boolean
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
- [`SwitchFieldBinding`](/es/docs/api/functions/SwitchFieldBinding)  interruptor booleano simple

Enlaces:
- [API](/es/docs/api/interfaces/BooleanProperty)
