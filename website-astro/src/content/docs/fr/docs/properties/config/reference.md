---
slug: fr/docs/properties/config/reference
title: Reference
sidebar_label: Reference
description: Configuration des propriétés de référence dans FireCMS, liant des entités à d'autres collections avec des aperçus et des filtres.
---

```tsx
import { buildProperty } from "@firecms/core";

const productsReferenceProperty = buildProperty({
    name: "Product",
    dataType: "reference",
    path: "products",
    previewProperties: ["name", "main_image"]
});
```

### `path`

Chemin absolu de la collection vers laquelle cette référence pointe. Le schéma de l'entité est déduit à partir de la navigation racine,
donc les filtres et le délégué de recherche existants s'appliquent également à cette vue.

### `previewProperties`

Liste des propriétés rendues comme aperçu de cette référence.
Par défaut les 3 premières.

### `forceFilter`

Forcer un filtre dans la sélection de référence. S'il est appliqué, le reste des filtres
sera désactivé. Les filtres appliqués avec cette prop ne peuvent pas être modifiés.
ex. `forceFilter: { age: [">=", 18] }`

### `validation`

* `required` Si ce champ doit être obligatoire.
* `requiredMessage` Message à afficher comme erreur de validation.

### `includeId`

Si la référence doit inclure l'ID de l'entité. Par défaut `true`.

### `includeEntityLink`

Si la référence doit inclure un lien vers l'entité (ouvrir les détails de l'entité). Par défaut `true`.

### `defaultValue`

Valeur par défaut pour cette propriété.
Vous pouvez définir la valeur par défaut en définissant un EntityReference :

```tsx

import { buildProperty, EntityReference } from "@firecms/core";

const productsReferenceProperty = buildProperty({
    name: "Product",
    dataType: "reference",
    path: "products",
    defaultValue: new EntityReference("B000P0MDMS", "products")
});
```

---

Le widget créé est

- [`ReferenceFieldBinding`](../../api/functions/ReferenceFieldBinding) Champ
  qui ouvre un
  dialogue de sélection de référence

Liens :

- [API](../../api/interfaces/ReferenceProperty)
