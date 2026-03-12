---
slug: it/docs/properties/fields/text_fields
title: Campi di testo
---


### Campo di testo semplice

![Textfield](/img/fields/Textfield.png)

Il widget più basilare è il campo di testo, che permette all'utente di inserire semplici
stringhe.

Se definisci una proprietà stringa senza altri parametri di configurazione, otterrai
un campo di testo:

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

Il tipo di dato è [`string`](../config/string) o [`number`](../config/number).

Il componente utilizzato internamente
è [`TextFieldBinding`](../../api/functions/TextFieldBinding).

### Campo di testo multiriga

![Textfield](/img/fields/Multiline_textfield.png)

Usa un campo multiriga quando vuoi permettere all'utente di inserire stringhe che possono
contenere interruzioni di riga.

Imposta il flag `multiline` su `true` in una proprietà stringa.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Descrizione",
    multiline: true,
    validation: {
        // ...
    }
});
```

Il tipo di dato è [`string`](../config/string).

Il componente utilizzato internamente
è [`TextFieldBinding`](../../api/functions/TextFieldBinding).


### Campo di testo Markdown

![Textfield](/img/fields/Markdown.png)

Puoi usare un campo markdown quando vuoi che l'utente finale utilizzi le capacità di
modifica avanzata del testo nel formato Markdown.

Imposta il flag `markdown` su `true` in una proprietà stringa.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Testo del blog",
    markdown: true,
    validation: {
        // ...
    }
});
```

Il tipo di dato è [`string`](../config/string).

Il componente utilizzato internamente
è [`MarkdownEditorFieldBinding`](../../api/functions/MarkdownEditorFieldBinding).


### Campo URL

![Textfield](/img/fields/Url.png)

Puoi usare un campo URL quando vuoi assicurarti che l'input dell'utente finale
sia un URL valido.

Imposta il flag `url` su `true` in una proprietà stringa.

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

Il tipo di dato è [`string`](../config/string).

Il componente utilizzato internamente
è [`TextFieldBinding`](../../api/functions/TextFieldBinding).


### Campo Email

![Field](/img/fields/Email.png)

Puoi usare un campo email quando vuoi assicurarti che l'input dell'utente finale
sia un'email valida.

Imposta il flag `email` su `true` in una proprietà stringa.

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Email utente",
    email: true,
    validation: {
        // ...
    }
});
```

Il tipo di dato è [`string`](../config/string).

Il componente utilizzato internamente
è [`TextFieldBinding`](../../api/functions/TextFieldBinding).
