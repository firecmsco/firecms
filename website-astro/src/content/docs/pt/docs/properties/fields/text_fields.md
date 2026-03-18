---
title: Campos de texto
slug: pt/docs/properties/fields/text_fields
---


### Campo de texto simples

![Textfield](/img/fields/Textfield.png)

O widget mais básico é o campo de texto, que permite ao usuário inserir
strings simples.

Se você definir uma propriedade string sem outros parâmetros de configuração,
obterá um campo de texto:

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Nome",
    validation: {
        // ...
    }
});
```

O tipo de dado é [`string`](../config/string) ou [`number`](../config/number).

Internamente, o componente utilizado
é [`TextFieldBinding`](../../api/functions/TextFieldBinding).

### Campo de texto multilinha

![Textfield](/img/fields/Multiline_textfield.png)

Use um campo multilinha quando quiser permitir que o usuário insira strings que
possam conter quebras de linha.

Defina o flag `multiline` como `true` em uma propriedade string.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Descrição",
    multiline: true,
    validation: {
        // ...
    }
});
```

O tipo de dado é [`string`](../config/string).

Internamente, o componente utilizado
é [`TextFieldBinding`](../../api/functions/TextFieldBinding).


### Campo de texto Markdown

![Textfield](/img/fields/Markdown.png)

Você pode usar um campo markdown quando quiser que o usuário final utilize
recursos avançados de edição de texto no formato Markdown.

Defina o flag `markdown` como `true` em uma propriedade string.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Texto do blog",
    markdown: true,
    validation: {
        // ...
    }
});
```

O tipo de dado é [`string`](../config/string).

Internamente, o componente utilizado
é [`MarkdownEditorFieldBinding`](../../api/functions/MarkdownEditorFieldBinding).


### Campo de URL

![Textfield](/img/fields/Url.png)

Você pode usar um campo URL quando quiser garantir que a entrada do usuário
final seja uma URL válida.

Defina o flag `url` como `true` em uma propriedade string.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Link Amazon",
    url: true,
    validation: {
        // ...
    }
});
```

O tipo de dado é [`string`](../config/string).

Internamente, o componente utilizado
é [`TextFieldBinding`](../../api/functions/TextFieldBinding).


### Campo de e-mail

![Field](/img/fields/Email.png)

Você pode usar um campo de e-mail quando quiser garantir que a entrada do
usuário final seja um e-mail válido.

Defina o flag `email` como `true` em uma propriedade string.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "E-mail do usuário",
    email: true,
    validation: {
        // ...
    }
});
```

O tipo de dado é [`string`](../config/string).

Internamente, o componente utilizado
é [`TextFieldBinding`](../../api/functions/TextFieldBinding).
