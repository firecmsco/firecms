---
slug: pt/docs/properties/config/reference
title: Reference
sidebar_label: Reference
description: Configuração de propriedades de referência no FireCMS, vinculando entidades a outras coleções com pré-visualizações e filtros.
---

```tsx
import { buildProperty } from "@firecms/core";

const productsReferenceProperty = buildProperty({
    name: "Product",
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
});
```

### `path`
Caminho absoluto da coleção para a qual esta referência aponta.

### `previewProperties`
Lista de propriedades renderizadas como pré-visualização desta referência. Padrão as 3 primeiras.

### `forceFilter`
Forçar um filtro na seleção de referência.

### `validation`

* `required` Se este campo deve ser obrigatório.
* `requiredMessage` Mensagem a ser exibida como erro de validação.

---

O widget criado é
- [`ReferenceFieldBinding`](../../api/functions/ReferenceFieldBinding) Campo que abre um diálogo de seleção de referência

Links:
- [API](../../api/interfaces/ReferenceProperty)
