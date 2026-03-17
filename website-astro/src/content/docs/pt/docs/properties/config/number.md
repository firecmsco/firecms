---
title: Number
sidebar_label: Number
description: Configuração de propriedades numéricas no FireCMS, incluindo validação, enums e restrições de inteiros.
---

```tsx
import { buildProperty } from "@firecms/core";

const rangeProperty = buildProperty({
    name: "Range",
    validation: {
        min: 0,
        max: 3
    },
    dataType: "number"
});
```

### `clearable`
Adiciona um ícone para limpar o valor e defini-lo como `null`. Padrão `false`

### `enumValues`
Você pode usar os valores enum fornecendo um map de valores exclusivos possíveis que a propriedade pode assumir, mapeados para o rótulo exibido no dropdown.

### `validation`

* `required` Se este campo deve ser obrigatório.
* `requiredMessage` Mensagem a ser exibida como erro de validação.
* `min` Definir o valor mínimo permitido.
* `max` Definir o valor máximo permitido.
* `lessThan` O valor deve ser menor que.
* `moreThan` O valor deve ser maior que.
* `positive` O valor deve ser um número positivo.
* `negative` O valor deve ser um número negativo.
* `integer` O valor deve ser um inteiro.

---

Os widgets criados são
- [`TextFieldBinding`](../../api/functions/TextFieldBinding) campo de texto genérico
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) se os `enumValues` estiverem definidos na configuração, este campo renderiza um select
  onde cada opção é um chip colorido.

Links:
- [API](../../api/interfaces/NumberProperty)
