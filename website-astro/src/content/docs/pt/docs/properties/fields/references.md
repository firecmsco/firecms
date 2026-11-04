---
title: Referências
slug: pt/docs/properties/fields/references
---

Use campos de referência quando precisar estabelecer relações entre coleções.
Por exemplo, pode ter um produto que está relacionado a uma categoria, ou um
que tem múltiplas compras.

Quando configura uma aplicação FireCMS, define coleções sob caminhos (ou aliases
de caminho), e esses são os caminhos que usa para configurar propriedades de
referência.

### Campo de referência única

![Field](/img/fields/Reference.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "reference",
    path: "users",
    name: "Related client",
});
```

O tipo de dado é [`reference`](/pt/docs/properties/config/reference)

Internamente o componente usado
é [`ReferenceFieldBinding`](/pt/docs/api/functions/ReferenceFieldBinding).


### Campo de referência múltipla

![Field](/img/fields/Multi_reference.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Related products",
    of: {
        dataType: "reference",
        path: "products"
    }
});
```

O tipo de dado é [`array`](/pt/docs/properties/config/array) com uma propriedade de referência
como a prop `of`.

Internamente o componente usado
é [`ArrayOfReferencesFieldBinding`](/pt/docs/api/functions/ArrayOfReferencesFieldBinding).

