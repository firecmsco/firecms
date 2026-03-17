---
title: Champs de date/heure
---

Utilisez les champs de date/heure pour permettre aux utilisateurs de définir des dates, enregistrées comme des timestamps Firestore.

Vous pouvez choisir entre utiliser des champs de dates ou de date/heure. Vous pouvez également créer des champs en lecture seule qui se mettent à jour automatiquement lorsque les entités sont créées ou mises à jour.

Le type de données est [`date`](../config/date).

En interne, le composant utilisé est [`DateTimeFieldBinding`](../../api/functions/DateTimeFieldBinding).

#### Champ de date

![Field](/img/fields/Date.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Expiry date",
    mode: "date"
});
```

#### Champ de date/heure

![Field](/img/fields/Date_time.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Arrival time",
    mode: "date_time"
});
```

#### Champ de date en lecture seule (création automatique)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Created on",
    autoValue: "on_create"
});
```

#### Champ de date en lecture seule (mise à jour automatique)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "date",
    name: "Updated on",
    autoValue: "on_update"
});
```
