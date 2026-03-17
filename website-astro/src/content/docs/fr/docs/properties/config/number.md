---
title: Number
sidebar_label: Number
description: Configuration des propriétés numériques dans FireCMS, incluant la validation, les enums et les contraintes d'entiers.
---

```tsx
import { buildProperty } from "@firecms/core";

const rangeProperty = buildProperty({
    name: "Range",
    validation: {
        min: 0,
        max: 3
    },
    dataType: "number"
});
```

### `clearable`
Ajoute une icône pour effacer la valeur et la définir à `null`. Par défaut `false`


### `enumValues`
Vous pouvez utiliser les valeurs enum en fournissant un map de valeurs
  exclusives possibles que la propriété peut prendre, mappées à l'étiquette affichée
  dans le dropdown.


```tsx
import { buildProperty, buildEnumValueConfig } from "@firecms/core";

const property = buildProperty({
    name: "Status",
    dataType: "number",
    enumValues: [
      buildEnumValueConfig({
        id: "-1",
        label: "Lightly tense",
        color: "redLighter"
      }),
      buildEnumValueConfig({
        id: "0",
        label: "Normal",
        color: "grayLight"
      }),
      buildEnumValueConfig({
        id: "1",
        label: "Lightly relaxed",
        color: "blueLighter"
      })
    ]
});
```

### `validation`

* `required` Si ce champ doit être obligatoire.
* `requiredMessage` Message à afficher comme erreur de validation.
* `min` Définir la valeur minimale autorisée.
* `max` Définir la valeur maximale autorisée.
* `lessThan` La valeur doit être inférieure à.
* `moreThan` La valeur doit être supérieure à.
* `positive` La valeur doit être un nombre positif.
* `negative` La valeur doit être un nombre négatif.
* `integer` La valeur doit être un entier.


---

Les widgets créés sont
- [`TextFieldBinding`](../../api/functions/TextFieldBinding) champ de texte générique
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) si les `enumValues` sont définies dans la configuration du string, ce champ rend un select
  où chaque option est un chip coloré.

Liens :
- [API](../../api/interfaces/NumberProperty)
