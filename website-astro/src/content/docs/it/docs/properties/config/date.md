---
slug: it/docs/properties/config/date
title: Data/Ora
sidebar_label: Data/Ora
description: Configurazione per le proprietà data e ora in FireCMS, inclusi valori automatici, modalità data e validazione.
---

```tsx
import { buildProperty } from "@firecms/core";

const publicationProperty = buildProperty({
    name: "Data di pubblicazione",
    dataType: "date"
});
```
### `autoValue` "on_create" | "on_update"

Usa questa prop per aggiornare automaticamente questa data alla creazione o
all'aggiornamento dell'entità.

### `mode` "date" | "date_time"

Imposta la granularità del campo su data, o data + ora.
Default `date_time`.

### `clearable`
Aggiunge un'icona per cancellare il valore e impostarlo a `null`. Default `false`

### `validation`

* `required` Questo campo deve essere obbligatorio.
* `requiredMessage` Messaggio da visualizzare come errore di validazione.
* `min` Imposta la data minima consentita.
* `max` Imposta la data massima consentita.

---

Il widget creato è
- [`DateTimeFieldBinding`](../../api/functions/DateTimeFieldBinding) Campo che permette di selezionare una data

Link:
- [API](../../api/interfaces/DateProperty)
