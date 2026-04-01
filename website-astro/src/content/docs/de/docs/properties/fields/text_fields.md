---
title: Textfelder
slug: de/docs/properties/fields/text_fields
---


### Einfaches Textfeld

![Textfield](/img/fields/Textfield.png)

Das grundlegendste Widget ist das Textfeld, mit dem Benutzer einfache Strings eingeben können.

Wenn Sie eine String-Eigenschaft ohne andere Konfigurationsparameter definieren, erhalten Sie ein Textfeld:

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

### Mehrzeiliges Textfeld

![Textfield](/img/fields/Multiline_textfield.png)

Verwenden Sie ein mehrzeiliges Feld, wenn Sie dem Benutzer ermöglichen möchten, Strings mit Zeilenumbrüchen einzugeben.

Setzen Sie das `multiline`-Flag auf `true` in einer String-Eigenschaft.

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

### Markdown-Textfeld

![Textfield](/img/fields/Markdown.png)

Verwenden Sie ein Markdown-Feld, wenn der Endbenutzer erweiterte Textbearbeitungsfunktionen im Markdown-Format nutzen soll.

Setzen Sie das `markdown`-Flag auf `true` in einer String-Eigenschaft.

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

### URL-Textfeld

![Textfield](/img/fields/Url.png)

Verwenden Sie ein URL-Feld, wenn Sie sicherstellen möchten, dass die Eingabe des Endbenutzers eine gültige URL ist.

Setzen Sie das `url`-Flag auf `true` in einer String-Eigenschaft.

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

### E-Mail-Feld

![Field](/img/fields/Email.png)

Verwenden Sie ein E-Mail-Feld, wenn Sie sicherstellen möchten, dass die Eingabe des Endbenutzers eine gültige E-Mail ist.

Setzen Sie das `email`-Flag auf `true` in einer String-Eigenschaft.

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
