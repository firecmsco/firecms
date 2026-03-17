---
title: Array
sidebar_label: Array
description: Configuration des propriétés de type array dans FireCMS, incluant les arrays typés, les tuples, les blocs (oneOf) et la validation.
---

###  `of`

La propriété de ce tableau.

Vous pouvez spécifier n'importe quelle propriété (sauf une autre propriété Array, car
Firestore ne le supporte pas).
Vous ne pouvez laisser ce champ vide que si vous fournissez un champ personnalisé ou
fournissez un champ `oneOf`, sinon une erreur sera levée.

Exemple de propriété tableau `of` :
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

Vous pouvez également spécifier un tableau de propriétés pour définir un tuple :
```tsx
import { buildProperty } from "@firecms/core";

const tupleDates = buildProperty({
  name: "Date Range (Start to End)",
  dataType: "array",
  of: [
    {
      name: "Start Date",
      dataType: "date"
    },
    {
      name: "End Date",
      dataType: "date"
    }
  ]
});
```

### `oneOf`

Utilisez ce champ si vous souhaitez avoir un tableau de propriétés.
C'est utile si vous avez besoin d'avoir des valeurs de types différents dans le même
tableau.
Chaque entrée du tableau est un objet de la forme :
```
{ type: "YOUR_TYPE", value: "YOUR_VALUE"}
```
Notez que vous pouvez utiliser n'importe quelle propriété, donc `value` peut prendre n'importe quelle valeur (chaînes,
nombres, tableaux, objets...)
Vous pouvez personnaliser les champs `type` et `value` selon vos besoins.

Un exemple d'utilisation de cette fonctionnalité peut être une entrée de blog, où vous avez
des images et des blocs de texte en markdown.

Exemple de champ `oneOf` :
```tsx
import { buildProperty } from "@firecms/core";

const contentProperty = buildProperty({
  name: "Content",
  description: "Example of a complex array with multiple properties as children",
  validation: { required: true },
  dataType: "array",
  oneOf: {
    typeField: "type",
    valueField: "value",
    properties: {
      name: {
        name: "Title",
        dataType: "string"
      },
      text: {
        dataType: "string",
        name: "Text",
        markdown: true
      }
    }
  }
});
```


### `sortable`

Contrôle si les éléments de ce tableau peuvent être réordonnés. Par défaut `true`.
Cette propriété n'a aucun effet si `disabled` est défini sur `true`.

Exemple :
```tsx
import { buildProperty } from "@firecms/core";

const tagsProperty = buildProperty({
  name: "Tags",
  dataType: "array",
  of: {
    dataType: "string",
    previewAsTag: true
  },
  sortable: false // désactiver le réordonnement
});
```

### `canAddElements`

Contrôle si des éléments peuvent être ajoutés au tableau. Par défaut `true`.
Cette propriété n'a aucun effet si `disabled` est défini sur `true`.

Exemple :
```tsx
import { buildProperty } from "@firecms/core";

const readOnlyTagsProperty = buildProperty({
  name: "Tags",
  dataType: "array",
  of: {
    dataType: "string"
  },
  canAddElements: false // empêcher l'ajout de nouveaux tags
});
```

### `expanded`

Détermine si le champ doit être initialement développé. Par défaut `true`.

### `minimalistView`

Lorsque défini sur `true`, affiche les propriétés enfants directement sans être enveloppées dans un panneau extensible.


### `validation`

* `required` Si ce champ doit être obligatoire.
* `requiredMessage` Message à afficher comme erreur de validation.
* `min` Définir la longueur minimale autorisée.
* `max` Définir la longueur maximale autorisée.

---

En fonction de votre configuration, les widgets de champ de formulaire créés sont :
- [`RepeatFieldBinding`](../../api/functions/RepeatFieldBinding) champ de tableau générique qui permet le réordonnement et rend
  la propriété enfant comme nœuds.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding) si la propriété `of` est un `string` avec configuration de stockage.
- [`ArrayOfReferencesFieldBinding`](../../api/functions/ArrayOfReferencesFieldBinding) si la propriété `of` est une `reference`
- [`BlockFieldBinding`](../../api/functions/BlockFieldBinding) si la propriété `oneOf` est spécifiée

Liens :
- [API](../../api/interfaces/ArrayProperty)
