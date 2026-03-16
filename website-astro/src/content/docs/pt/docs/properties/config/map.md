---
slug: pt/docs/properties/config/map
title: Map
sidebar_label: Map
description: Configuração de propriedades do tipo map (objetos aninhados) no FireCMS, incluindo propriedades filhas, pré-visualizações e modo chave-valor.
---

Em uma propriedade map, você define propriedades filhas da mesma forma que as define
no nível do esquema da entidade:

```tsx
import { buildProperty } from "@firecms/core";

const ctaProperty = buildProperty({
    dataType: "map",
    properties: {
        name: {
            name: "Name",
            description: "Text that will be shown on the button",
            validation: { required: true },
            dataType: "string"
        },
        type: {
            name: "Type",
            description: "Action type that determines the user flow",
            validation: { required: true, uniqueInArray: true },
            dataType: "string",
            enumValues: {
                complete: "Complete",
                continue: "Continue"
            }
        }
    }
});
```

### `properties`
Registro de propriedades incluídas neste map.

### `previewProperties`
Lista de propriedades renderizadas como pré-visualização deste map. Padrão as 3 primeiras.

### `spreadChildren`
Exibe as propriedades filhas como colunas independentes na vista
de coleção. Padrão `false`.

### `pickOnlySomeKeys`
Permite ao utilizador adicionar apenas algumas chaves neste map.
Por padrão, todas as propriedades do map têm o campo correspondente na
vista de formulário. Definir este flag como true permite selecionar apenas algumas.
Útil para maps que possam ter muitas sub-propriedades que podem não ser necessárias.

### `expanded`
Determina se o campo deve ser inicialmente expandido. Padrão `true`.

### `keyValue`
Renderiza este map como um array chave-valor que permite usar
chaves arbitrárias. Não precisa definir as propriedades neste caso.

### `minimalistView`
Quando definido como `true`, exibe as propriedades filhas diretamente sem serem envolvidas em um painel expansível.

### `validation`

* `required` Se este campo deve ser obrigatório.
* `requiredMessage` Mensagem a ser exibida como erro de validação.

---

O widget criado é
- [`MapFieldBinding`](../../api/functions/MapFieldBinding) Campo que renderiza os campos
  de propriedades filhas

Links:
- [API](../../api/interfaces/MapProperty)
