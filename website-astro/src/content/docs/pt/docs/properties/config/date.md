---
title: Data/Hora
slug: pt/docs/properties/config/date
sidebar_label: Data/Hora
description: Configuração de propriedades de data e hora no FireCMS, incluindo auto-valores, modos de data e validação.
---

```tsx
import { buildProperty } from "@firecms/core";

const publicationProperty = buildProperty({
    name: "Publication date",
    dataType: "date"
});
```
### `autoValue` "on_create" | "on_update"

Use esta prop para atualizar esta data automaticamente na criação
ou atualização de uma entidade.

### `mode` "date" | "date_time"

Defina a granularidade do campo para uma data, ou data + hora.
Padrão `date_time`.

### `clearable`
Adiciona um ícone para limpar o valor e defini-lo como `null`. Padrão `false`

### `validation`

* `required` Se este campo deve ser obrigatório.
* `requiredMessage` Mensagem a ser exibida como erro de validação.
* `min` Definir a data mínima permitida.
* `max` Definir a data máxima permitida.

---

O widget criado é
- [`DateTimeFieldBinding`](../../api/functions/DateTimeFieldBinding) Campo que permite selecionar uma data

Links:
- [API](../../api/interfaces/DateProperty)
