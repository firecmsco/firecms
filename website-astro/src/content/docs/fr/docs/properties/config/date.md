---
title: Date/Heure
slug: fr/docs/properties/config/date
sidebar_label: Date/Heure
description: Configuration des propriétés de date et heure dans FireCMS, incluant les auto-valeurs, les modes de date et la validation.
---

```tsx
import { buildProperty } from "@firecms/core";

const publicationProperty = buildProperty({
    name: "Publication date",
    dataType: "date"
});
```
### `autoValue` "on_create" | "on_update"

Utilisez cette prop pour mettre à jour cette date automatiquement lors de la création
ou la mise à jour d'une entité.

### `mode` "date" | "date_time"

Définissez la granularité du champ à une date, ou date + heure.
Par défaut `date_time`.

### `clearable`
Ajoute une icône pour effacer la valeur et la définir à `null`. Par défaut `false`

### `validation`

* `required` Si ce champ doit être obligatoire.
* `requiredMessage` Message à afficher comme erreur de validation.
* `min` Définir la date minimale autorisée.
* `max` Définir la date maximale autorisée.

---

Le widget créé est
- [`DateTimeFieldBinding`](../../api/functions/DateTimeFieldBinding) Champ permettant de sélectionner une date

Liens :
- [API](../../api/interfaces/DateProperty)
