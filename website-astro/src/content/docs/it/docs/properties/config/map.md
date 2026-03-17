---
title: Map
sidebar_label: Map
description: Configurazione per le proprietà map (oggetti annidati) in FireCMS, incluse proprietà figlio, anteprime e modalità chiave-valore.
---

In una proprietà map definisci le proprietà figlio nello stesso modo in cui le definisci
a livello di schema entità:

```tsx
import { buildProperty } from "@firecms/core";

const ctaProperty = buildProperty({
    dataType: "map",
    properties: {
        name: {
            name: "Nome",
            description: "Testo che verrà mostrato sul pulsante",
            validation: { required: true },
            dataType: "string"
        },
        type: {
            name: "Tipo",
            description: "Tipo di azione che determina il flusso utente",
            validation: { required: true, uniqueInArray: true },
            dataType: "string",
            enumValues: {
                complete: "Completa",
                continue: "Continua"
            }
        }
    }
});
```

###  `properties`
Record delle proprietà incluse in questa map.

### `previewProperties`
Lista delle proprietà rese come anteprima di questa map. Default: prime 3.

### `spreadChildren`
Mostra le proprietà figlio come colonne indipendenti nella vista collezione. Default `false`.

### `pickOnlySomeKeys`

Permette all'utente di aggiungere solo alcune chiavi in questa map.
Per default, tutte le proprietà della map hanno il campo corrispondente nella
vista form. Impostare questo flag su true permette di selezionarne solo alcune.
Utile per map che possono avere molte sotto-proprietà non sempre necessarie.

### `expanded`

Determina se il campo deve essere inizialmente espanso. Default `true`.

### `keyValue`

Renderizza questa map come una tabella chiave-valore che permette di usare
chiavi arbitrarie. Non è necessario definire le proprietà in questo caso.

### `minimalistView`

Quando impostato su `true`, mostra le proprietà figlio direttamente senza essere avvolte in un pannello espandibile.

### `validation`

* `required` Questo campo deve essere obbligatorio.
* `requiredMessage` Messaggio da visualizzare come errore di validazione.

---

Il widget creato è
- [`MapFieldBinding`](../../api/functions/MapFieldBinding) Campo che renderizza i campi delle proprietà figlio

Link:
- [API](../../api/interfaces/MapProperty)
