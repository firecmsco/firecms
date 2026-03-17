---
title: Campi data/ora
---

Usa i campi data/ora per consentire agli utenti di impostare date, salvate come timestamp Firestore.

Puoi scegliere tra l'uso di date o campi data/ora.
Puoi anche creare campi in sola lettura che si aggiornano automaticamente quando
le entità vengono create o aggiornate.

Il tipo di dato è [`date`](../config/date).

Il componente utilizzato internamente
è [`DateTimeFieldBinding`](../../api/functions/DateTimeFieldBinding).

#### Campo data

![Field](/img/fields/Date.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Data di scadenza",
    mode: "date"
});
```

#### Campo data/ora

![Field](/img/fields/Date_time.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Ora di arrivo",
    mode: "date_time"
});
```

#### Aggiornamento alla creazione

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Creato il",
    autoValue: "on_create"
});
```

#### Aggiornamento all'aggiornamento

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Aggiornato il",
    autoValue: "on_update"
});
```
