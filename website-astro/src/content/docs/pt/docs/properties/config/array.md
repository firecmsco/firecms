---
title: Array
slug: pt/docs/properties/config/array
sidebar_label: Array
description: Configuração de propriedades de tipo array no FireCMS, incluindo arrays tipados, tuplas, blocos (oneOf) e validação.
---

###  `of`

A propriedade deste array.

Você pode especificar qualquer propriedade (exceto outra propriedade Array, pois
o Firestore não suporta isso).
Você pode deixar este campo vazio apenas se fornecer um campo personalizado ou
fornecer um campo `oneOf`, caso contrário um erro será lançado.

Exemplo de propriedade array `of`:
```tsx
import { buildProperty } from "@firecms/core";

const productReferences = buildProperty({
  name: "Products",
  dataType: "array",
  of: {
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
  }
});
```

#### tupla

Você também pode especificar um array de propriedades para definir uma tupla:
```tsx
import { buildProperty } from "@firecms/core";

const tupleDates = buildProperty({
  name: "Date Range (Start to End)",
  dataType: "array",
  of: [
    {
      name: "Start Date",
      dataType: "date"
    },
    {
      name: "End Date",
      dataType: "date"
    }
  ]
});
```

### `oneOf`

Use este campo se deseja ter um array de propriedades.
Isto é útil se precisar ter valores de tipos diferentes no mesmo
array.
Cada entrada do array é um objeto da forma:
```
{ type: "YOUR_TYPE", value: "YOUR_VALUE"}
```
Note que você pode usar qualquer propriedade, então `value` pode assumir qualquer valor (strings,
números, arrays, objetos...)
Você pode personalizar os campos `type` e `value` conforme necessário.

Um exemplo de uso desta funcionalidade pode ser uma entrada de blog, onde você tem
imagens e blocos de texto em markdown.

Exemplo de campo `oneOf`:
```tsx
import { buildProperty } from "@firecms/core";

const contentProperty = buildProperty({
  name: "Content",
  description: "Example of a complex array with multiple properties as children",
  validation: { required: true },
  dataType: "array",
  oneOf: {
    typeField: "type",
    valueField: "value",
    properties: {
      name: {
        name: "Title",
        dataType: "string"
      },
      text: {
        dataType: "string",
        name: "Text",
        markdown: true
      }
    }
  }
});
```

### `sortable`

Controla se os elementos deste array podem ser reordenados. Padrão `true`.
Esta propriedade não tem efeito se `disabled` estiver definido como `true`.

### `canAddElements`

Controla se elementos podem ser adicionados ao array. Padrão `true`.
Esta propriedade não tem efeito se `disabled` estiver definido como `true`.

### `expanded`

Determina se o campo deve ser inicialmente expandido. Padrão `true`.

### `minimalistView`

Quando definido como `true`, exibe as propriedades filhas diretamente sem serem envolvidas em um painel expansível.

### `validation`

* `required` Se este campo deve ser obrigatório.
* `requiredMessage` Mensagem a ser exibida como erro de validação.
* `min` Definir o comprimento mínimo permitido.
* `max` Definir o comprimento máximo permitido.

---

Com base na sua configuração, os widgets de campo de formulário criados são:
- [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding) campo de array genérico
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding) se a propriedade `of` for um `string` com configuração de armazenamento.
- [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding) se a propriedade `of` for uma `reference`
- [`BlockFieldBinding`](../../api/functions/BlockFieldBinding) se a propriedade `oneOf` for especificada

Links:
- [API](../../api/interfaces/ArrayProperty)
