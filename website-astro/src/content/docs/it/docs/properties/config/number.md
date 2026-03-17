---
title: Number
sidebar_label: Number
description: Configurazione per le proprietà numeriche in FireCMS, inclusi validazione, enum e vincoli su numeri interi.
---

```tsx
import { buildProperty } from "@firecms/core";

const rangeProperty = buildProperty({
    name: "Intervallo",
    validation: {
        min: 0,
        max: 3
    },
    dataType: "number"
});
```

### `clearable`
Aggiunge un'icona per cancellare il valore e impostarlo a `null`. Default `false`


### `enumValues`
Puoi usare i valori enum fornendo una mappa di possibili
valori esclusivi che la proprietà può assumere, mappati all'etichetta che viene
visualizzata nel menu a discesa.


```tsx
import { buildProperty, buildEnumValueConfig } from "@firecms/core";

const property = buildProperty({
    name: "Stato",
    dataType: "number",
    enumValues: [
      buildEnumValueConfig({
        id: "-1",
        label: "Leggermente teso",
        color: "redLighter"
      }),
      buildEnumValueConfig({
        id: "0",
        label: "Normale",
        color: "grayLight"
      }),
      buildEnumValueConfig({
        id: "1",
        label: "Leggermente rilassato",
        color: "blueLighter"
      })
    ]
});
```

### `validation`

* `required` Questo campo deve essere obbligatorio.
* `requiredMessage` Messaggio da visualizzare come errore di validazione.
* `min` Imposta il valore minimo consentito.
* `max` Imposta il valore massimo consentito.
* `lessThan` Il valore deve essere minore di.
* `moreThan` Il valore deve essere maggiore di.
* `positive` Il valore deve essere un numero positivo.
* `negative` Il valore deve essere un numero negativo.
* `integer` Il valore deve essere un numero intero.


---

I widget creati sono
- [`TextFieldBinding`](../../api/functions/TextFieldBinding) campo di testo generico
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) se `enumValues` sono impostati nella configurazione, questo campo renderizza un select dove ogni opzione è un chip colorato.

Link:
- [API](../../api/interfaces/NumberProperty)
