---
slug: pt/docs/properties/config/boolean
title: Boolean
sidebar_label: Boolean
description: Configuração de propriedades booleanas no FireCMS, renderizadas como interruptores toggle.
---

```tsx
import { buildProperty } from "@firecms/core";

const availableProperty = buildProperty({
    name: "Available",
    dataType: "boolean"
});
```

### `validation`

* `required` Se este campo deve ser obrigatório.
* `requiredMessage` Mensagem a ser exibida como erro de validação.

---

O widget criado é
- [`SwitchFieldBinding`](../../api/functions/SwitchFieldBinding) interruptor booleano simples

Links:
- [API](../../api/interfaces/BooleanProperty)
