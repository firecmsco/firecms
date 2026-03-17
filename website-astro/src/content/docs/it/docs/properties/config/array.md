---
title: Array
sidebar_label: Array
description: Configurazione per le proprietà array in FireCMS, inclusi array tipizzati, tuple, blocchi (oneOf) e validazione.
---

###  `of`

La proprietà di questo array.

Puoi specificare qualsiasi proprietà (tranne un'altra proprietà Array, poiché
Firestore non lo supporta).
Puoi lasciare questo campo vuoto solo se stai fornendo un campo personalizzato o
un campo `oneOf`, altrimenti verrà generato un errore.

Esempio di proprietà array con `of`:
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

#### tuple

Puoi anche specificare un array di proprietà per definire una tupla:
```tsx
import { buildProperty } from "@firecms/core";

const tupleDates = buildProperty({
  name: "Intervallo Date (Inizio - Fine)",
  dataType: "array",
  of: [
    {
      name: "Data Inizio",
      dataType: "date"
    },
    {
      name: "Data Fine",
      dataType: "date"
    }
  ]
});
```

### `oneOf`

Usa questo campo se vuoi avere un array di proprietà.
È utile se hai bisogno di valori di tipi diversi nello stesso array.
Ogni elemento dell'array è un oggetto con la forma:
```
{ type: "TUO_TIPO", value: "TUO_VALORE"}
```
Nota che puoi usare qualsiasi proprietà, quindi `value` può assumere qualsiasi valore (stringhe,
numeri, array, oggetti...).
Puoi personalizzare i campi `type` e `value` in base alle tue esigenze.

Un caso d'uso di esempio per questa funzionalità può essere una voce di blog, dove hai
immagini e blocchi di testo in markdown.

Esempio di campo `oneOf`:
```tsx
import { buildProperty } from "@firecms/core";

const contentProperty = buildProperty({
  name: "Content",
  description: "Esempio di array complesso con più proprietà come figli",
  validation: { required: true },
  dataType: "array",
  oneOf: {
    typeField: "type",
    valueField: "value",
    properties: {
      name: {
        name: "Titolo",
        dataType: "string"
      },
      text: {
        dataType: "string",
        name: "Testo",
        markdown: true
      }
    }
  }
});
```


### `sortable`

Controlla se gli elementi in questo array possono essere riordinati. Default `true`.
Questa proprietà non ha effetto se `disabled` è impostato su `true`.

Esempio:
```tsx
import { buildProperty } from "@firecms/core";

const tagsProperty = buildProperty({
  name: "Tags",
  dataType: "array",
  of: {
    dataType: "string",
    previewAsTag: true
  },
  sortable: false // disabilita il riordino
});
```

### `canAddElements`

Controlla se è possibile aggiungere elementi all'array. Default `true`.
Questa proprietà non ha effetto se `disabled` è impostato su `true`.

Esempio:
```tsx
import { buildProperty } from "@firecms/core";

const readOnlyTagsProperty = buildProperty({
  name: "Tags",
  dataType: "array",
  of: {
    dataType: "string"
  },
  canAddElements: false // impedisce l'aggiunta di nuovi tag
});
```

### `expanded`

Determina se il campo deve essere inizialmente espanso. Default `true`.

### `minimalistView`

Quando impostato su `true`, mostra le proprietà figlio direttamente senza essere avvolte in un pannello espandibile.


### `validation`

* `required` Questo campo deve essere obbligatorio.
* `requiredMessage` Messaggio da visualizzare come errore di validazione.
* `min` Imposta la lunghezza minima consentita.
* `max` Imposta la lunghezza massima consentita.

---

In base alla configurazione, i widget del campo form creati sono:
- [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding) campo array generico che permette il riordino e renderizza la proprietà figlio come nodi.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding) se la proprietà `of` è una `string` con configurazione di archiviazione.
- [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding) se la proprietà `of` è un `reference`
- [`BlockFieldBinding`](../../api/functions/BlockFieldBinding) se la proprietà `oneOf` è specificata

Link:
- [API](../../api/interfaces/ArrayProperty)
