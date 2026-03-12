---
slug: fr/docs/properties/fields/text_fields
title: Champs de texte (Text fields)
---


### Champ de texte simple

![Textfield](/img/fields/Textfield.png)

Le widget le plus basique est le champ de texte, qui permet à l'utilisateur de saisir des chaînes simples.

Si vous définissez une propriété string sans autres paramètres de configuration, vous obtiendrez un champ de texte :

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Name",
    validation: {
        // ...
    }
});
```

Le type de données est [`string`](../config/string) ou [`number`](../config/number).

En interne, le composant utilisé est [`TextFieldBinding`](../../api/functions/TextFieldBinding).

### Champ de texte multiligne

![Textfield](/img/fields/Multiline_textfield.png)

Utilisez un champ multiligne lorsque vous souhaitez permettre à l'utilisateur de saisir des chaînes pouvant contenir des sauts de ligne.

Définissez l'indicateur `multiline` à `true` dans une propriété string.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Description",
    multiline: true,
    validation: {
        // ...
    }
});
```

Le type de données est [`string`](../config/string).

En interne, le composant utilisé est [`TextFieldBinding`](../../api/functions/TextFieldBinding).


### Champ de texte Markdown

![Textfield](/img/fields/Markdown.png)

Vous pouvez utiliser un champ markdown lorsque vous souhaitez que l'utilisateur final utilise des capacités de modification avancées du texte au format Markdown.

Définissez l'indicateur `markdown` à `true` dans une propriété string.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Blog text",
    markdown: true,
    validation: {
        // ...
    }
});
```

Le type de données est [`string`](../config/string).

En interne, le composant utilisé est [`MarkdownEditorFieldBinding`](../../api/functions/MarkdownEditorFieldBinding).


### Champ de texte URL

![Textfield](/img/fields/Url.png)

Vous pouvez utiliser un champ URL lorsque vous souhaitez vous assurer que la saisie de l'utilisateur final est une URL valide.

Définissez l'indicateur `url` à `true` dans une propriété string.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Amazon link",
    url: true,
    validation: {
        // ...
    }
});
```

Le type de données est [`string`](../config/string).

En interne, le composant utilisé est [`TextFieldBinding`](../../api/functions/TextFieldBinding).


### Champ email

![Field](/img/fields/Email.png)

Vous pouvez utiliser un champ email lorsque vous souhaitez vous assurer que la saisie de l'utilisateur final est un email valide.

Définissez l'indicateur `email` à `true` dans une propriété string.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "User email",
    email: true,
    validation: {
        // ...
    }
});
```

Le type de données est [`string`](../config/string).

En interne, le composant utilisé est [`TextFieldBinding`](../../api/functions/TextFieldBinding).
