---
slug: de/docs/properties/fields/date_time
title: Datum/Uhrzeit-Felder
---

Verwenden Sie die Datum/Uhrzeit-Felder, damit Benutzer Datumsangaben setzen können, die als Firestore-Timestamps gespeichert werden.

Der Datentyp ist [`date`](../config/date).

#### Datumsfeld

![Field](/img/fields/Date.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Expiry date",
    mode: "date"
});
```

#### Datum/Uhrzeit-Feld

![Field](/img/fields/Date_time.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Arrival time",
    mode: "date_time"
});
```

#### Beim Erstellen aktualisieren

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Created at",
    autoValue: "on_create"
});
```

#### Beim Aktualisieren aktualisieren

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Updated at",
    autoValue: "on_update"
});
```
