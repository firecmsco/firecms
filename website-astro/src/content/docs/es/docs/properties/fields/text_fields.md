---
title: Campos de texto (Text fields)
slug: es/docs/properties/fields/text_fields
---


### Campo de texto simple (Simple text field)

![Textfield](/img/fields/Textfield.png)

El widget más básico es el campo de texto, que permite al usuario ingresar cadenas
simples (strings).

Si defines una propiedad de cadena sin otros parámetros de configuración,
obtendrás un campo de texto:

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Nombre",
    validation: {
        // ...
    }
});
```

El tipo de datos es [`string`](../config/string) o [`number`](../config/number).

Internamente, el componente utilizado
es [`TextFieldBinding`](../../api/functions/TextFieldBinding).

### Campo de texto multilínea (Multi line text field)

![Textfield](/img/fields/Multiline_textfield.png)

Usa un campo multilínea cuando desees permitir que el usuario ingrese cadenas que puedan
contener saltos de línea.

Establece la opción `multiline` en `true` en una propiedad de cadena.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Descripción",
    multiline: true,
    validation: {
        // ...
    }
});
```

El tipo de datos es [`string`](../config/string).

Internamente, el componente utilizado
es [`TextFieldBinding`](../../api/functions/TextFieldBinding).


### Campo de texto Markdown (Markdown text field)

![Textfield](/img/fields/Markdown.png)

Puedes usar un campo markdown cuando quieras que el usuario final use capacidades
avanzadas de edición de texto usando el formato Markdown.

Establece la opción `markdown` en `true` en una propiedad de cadena.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Texto del blog",
    markdown: true,
    validation: {
        // ...
    }
});
```

El tipo de datos es [`string`](../config/string).

Internamente, el componente utilizado
es [`MarkdownEditorFieldBinding`](../../api/functions/MarkdownEditorFieldBinding).


### Campo de texto de URL (Url text field)

![Textfield](/img/fields/Url.png)

Puedes usar un campo URL cuando desees asegurarte de que la entrada del
usuario final sea una URL válida.

Establece la bandera `url` en `true` en una propiedad de cadena.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Enlace de Amazon",
    url: true,
    validation: {
        // ...
    }
});
```

El tipo de datos es [`string`](../config/string).

Internamente, el componente utilizado
es [`TextFieldBinding`](../../api/functions/TextFieldBinding).


### Campo de correo electrónico (Email field)

![Field](/img/fields/Email.png)

Puedes utilizar un campo de correo electrónico cuando te gustaría asegurarte de que la entrada del
usuario final es un correo electrónico válido.

Establece la opción `email` en `true` en una propiedad de la cadena.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Correo del usuario",
    email: true,
    validation: {
        // ...
    }
});
```

El tipo de datos es [`string`](../config/string).

Internamente, el componente utilizado
es [`TextFieldBinding`](../../api/functions/TextFieldBinding).
