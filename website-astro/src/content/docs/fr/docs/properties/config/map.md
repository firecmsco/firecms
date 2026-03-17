---
title: Map
sidebar_label: Map
description: Configuration des propriétés de type map (objets imbriqués) dans FireCMS, incluant les propriétés enfants, les aperçus et le mode clé-valeur.
---

Dans une propriété map, vous définissez des propriétés enfants de la même manière que vous les définissez
au niveau du schéma d'entité :

```tsx
import { buildProperty } from "@firecms/core";

const ctaProperty = buildProperty({
    dataType: "map",
    properties: {
        name: {
            name: "Name",
            description: "Text that will be shown on the button",
            validation: { required: true },
            dataType: "string"
        },
        type: {
            name: "Type",
            description: "Action type that determines the user flow",
            validation: { required: true, uniqueInArray: true },
            dataType: "string",
            enumValues: {
                complete: "Complete",
                continue: "Continue"
            }
        }
    }
});
```

###  `properties`
Enregistrement des propriétés incluses dans ce map.

### `previewProperties`
Liste des propriétés rendues comme aperçu de ce map. Par défaut les 3 premières.

### `spreadChildren`
Affiche les propriétés enfants comme colonnes indépendantes dans la vue
de collection. Par défaut `false`.

### `pickOnlySomeKeys`

Permet à l'utilisateur d'ajouter seulement certaines clés dans ce map.
Par défaut, toutes les propriétés du map ont le champ correspondant dans
la vue de formulaire. Définir ce flag à true permet de ne sélectionner que certaines.
Utile pour les maps qui peuvent avoir beaucoup de sous-propriétés qui peuvent ne pas être
nécessaires.

### `expanded`

Détermine si le champ doit être initialement développé. Par défaut `true`.

### `keyValue`

Rend ce map comme un tableau clé-valeur qui permet d'utiliser
des clés arbitraires. Vous n'avez pas besoin de définir les propriétés dans ce cas.

### `minimalistView`

Lorsque défini sur `true`, affiche les propriétés enfants directement sans être enveloppées dans un panneau extensible.

### `validation`

* `required` Si ce champ doit être obligatoire.
* `requiredMessage` Message à afficher comme erreur de validation.

---

Le widget créé est
- [`MapFieldBinding`](../../api/functions/MapFieldBinding) Champ qui rend les champs
  de propriétés enfants

Liens :
- [API](../../api/interfaces/MapProperty)
