---
title: String
sidebar_label: String
description: Configuration des propriétés string dans FireCMS, incluant le stockage, le markdown, les enums et les options de validation.
---

La **propriété string** est le type de champ le plus polyvalent dans FireCMS. Utilisez-la pour tout, des simples champs de texte aux téléchargements de fichiers, éditeurs de texte riche et menus déroulants. Lors de la construction d'un **panneau d'administration** pour votre application **Firebase**, les propriétés string vous permettent de créer :

- **Champs de texte** : Noms, titres, descriptions
- **Menus déroulants de sélection** : Champs de statut, catégories, options
- **Téléchargement de fichiers** : Images, documents (stockés dans **Firebase Storage**)
- **Éditeurs markdown** : Contenu riche avec formatage
- **Champs email/URL** : Types d'entrée validés

```tsx
import { buildProperty } from "@firecms/core";

const nameProperty = buildProperty({
    name: "Name",
    description: "Basic string property with validation",
    validation: { required: true },
    dataType: "string"
});
```

### `storage`

Vous pouvez spécifier une configuration `StorageMeta`. Elle est utilisée pour
indiquer que cette chaîne fait référence à un chemin dans Google Cloud Storage.

* `mediaType` Type de média de cette référence, utilisé pour afficher l'aperçu.
* `acceptedFiles` [Type MIME](https://developer.mozilla.org/fr/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) de fichier pouvant être téléchargé vers cette
  référence. Notez que vous pouvez aussi utiliser la notation astérisque, donc `image/*`
  accepte tout fichier image, et ainsi de suite.
* `metadata` Métadonnées spécifiques définies dans votre fichier téléchargé.
* `fileName` Vous pouvez utiliser cette prop pour personnaliser le nom de fichier téléchargé.
  Vous pouvez utiliser une fonction comme callback ou une chaîne où vous
  spécifiez des espaces réservés qui sont remplacés par les valeurs correspondantes.
  - `{file}` - Nom complet du fichier
  - `{file.name}` - Nom du fichier sans extension
  - `{file.ext}` - Extension du fichier
  - `{rand}` - Valeur aléatoire utilisée pour éviter les collisions de noms
  - `{entityId}` - ID de l'entité
  - `{propertyKey}` - ID de cette propriété
  - `{path}` - Chemin de cette entité
* `storagePath` Chemin absolu dans votre bucket.
  Vous pouvez utiliser une fonction comme callback ou une chaîne où vous
  spécifiez des espaces réservés qui sont remplacés par les valeurs correspondantes.
  - `{file}` - Nom complet du fichier
  - `{file.name}` - Nom du fichier sans extension
  - `{file.ext}` - Extension du fichier
  - `{rand}` - Valeur aléatoire utilisée pour éviter les collisions de noms
  - `{entityId}` - ID de l'entité
  - `{propertyKey}` - ID de cette propriété
  - `{path}` - Chemin de cette entité
* `includeBucketUrl` Lorsque défini à `true`, FireCMS stockera une URL
  de stockage complète au lieu uniquement du chemin de stockage.
  Pour Firebase Storage, c'est une URL `gs://...`, par ex.
  `gs://my-bucket/path/to/file.png`.
  Par défaut `false`.
* `storeUrl` Lorsque défini à `true`, ce flag indique que l'URL
  de téléchargement du fichier sera enregistrée dans Firestore au lieu du chemin Cloud
  Storage. Notez que l'URL générée peut utiliser un token qui, s'il est
  désactivé, peut rendre l'URL inutilisable et perdre la référence originale à
  Cloud Storage, il n'est donc pas recommandé d'utiliser ce flag. Par défaut
  `false`.
* `maxSize` Taille maximale du fichier en octets.
* `processFile` Utilisez ce callback pour traiter le fichier avant de le télécharger.
  Si vous retournez `undefined`, le fichier original est téléchargé.
* `postProcess` Post-traiter la valeur enregistrée (chemin de stockage, URL de stockage ou URL de téléchargement)
  après sa résolution.
* `previewUrl` Fournir une URL d'aperçu personnalisée pour un nom de fichier donné.

#### Images : redimensionner/compresser avant le téléchargement

FireCMS supporte l'optimisation d'images côté client avant le téléchargement :

* `imageResize` (recommandé) Configuration avancée de redimensionnement et recadrage d'images.
  Appliqué uniquement aux images (`image/jpeg`, `image/png`, `image/webp`).
  - `maxWidth`, `maxHeight`
  - `mode` : `contain` ou `cover`
  - `format` : `original`, `jpeg`, `png`, `webp`
  - `quality` : 0-100

* `imageCompression` (déprécié) Redimensionnement/compression d'images hérité.

```tsx
import { buildProperty } from "@firecms/core";

const imageProperty = buildProperty({
    dataType: "string",
    storage: {
        mediaType: "image",
        storagePath: (context) => {
            return "images";
        },
        acceptedFiles: ["image/*"],
        fileName: (context) => {
            return context.file.name;
        },
        includeBucketUrl: true,
        imageResize: {
            maxWidth: 1200,
            maxHeight: 1200,
            mode: "cover",
            format: "webp",
            quality: 85
        }
    }
});
```

### `url`

Si la valeur de cette propriété est une URL, vous pouvez définir ce flag
à `true` pour ajouter un lien, ou l'un des types de média supportés pour rendre un
aperçu.

```tsx
import { buildProperty } from "@firecms/core";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Amazon link",
    url: true
});
```

Vous pouvez aussi définir le type d'aperçu pour l'url : `image`, `video` ou `audio` :

```tsx
import { buildProperty } from "@firecms/core";

const imageProperty = buildProperty({
    name: "Image",
    dataType: "string",
    url: "image",
});
```

### `email`

Si défini à `true`, ce champ sera validé comme une adresse email et
rendu avec un input spécifique aux emails. Utile pour les formulaires de contact,
profils utilisateurs ou tout champ devant contenir un email valide.

```tsx
import { buildProperty } from "@firecms/core";

const emailProperty = buildProperty({
    name: "Email",
    dataType: "string",
    email: true
});
```

### `userSelect`

Cette propriété est utilisée pour indiquer que la chaîne est un **ID utilisateur**, et
elle sera rendue comme un sélecteur d'utilisateur. Notez que l'ID utilisateur doit être celui
utilisé dans votre fournisseur d'authentification, par ex. Firebase Auth.
Vous pouvez aussi utiliser un property builder pour spécifier le chemin utilisateur dynamiquement
basé sur d'autres valeurs de l'entité.

```tsx
import { buildProperty } from "@firecms/core";

const assignedUserProperty = buildProperty({
    name: "Assigned User",
    dataType: "string",
    userSelect: true
});
```

### `enumValues`

Vous pouvez utiliser les valeurs enum en fournissant un map de valeurs exclusives possibles que la
propriété peut prendre, mappées à l'étiquette affichée dans le dropdown. Vous
pouvez utiliser un objet simple au format
`value` => `label`, ou au format `value`
=> [`EnumValueConfig`](../../api/type-aliases/EnumValueConfig) si vous avez besoin de plus de
personnalisation (comme désactiver des options spécifiques ou assigner des couleurs). Si vous
avez besoin de garantir l'ordre des éléments, vous pouvez passer un `Map` au lieu d'un
objet simple.

```tsx
import { buildProperty } from "@firecms/core";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Amazon link",
    enumValues: {
        "es": "Spanish",
        "de": "German",
        "en": "English",
        "it": "Italian",
        "fr": {
            id: "fr",
            label: "French",
            disabled: true
        }
    }
});
```

### `multiline`

Si cette propriété string est assez longue pour être affichée
dans un champ multi-lignes. Par défaut false. Si défini à `true`, le nombre
de lignes s'adapte au contenu.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    name: "Description",
    dataType: "string",
    multiline: true
});
```

### `clearable`

Ajoute une icône pour effacer la valeur et la définir à `null`. Par défaut `false`

### `markdown`

Si cette propriété string doit être affichée comme un champ markdown.
Si `true`, le champ est rendu comme un éditeur de texte qui supporte la
syntaxe de coloration markdown. Il inclut aussi un aperçu du résultat.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    dataType: "string",
    name: "Text",
    markdown: true
});
```

### `previewAsTag`

Si cette chaîne doit être rendue comme un tag au lieu de simple texte.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    name: "Tags",
    description: "Example of generic array",
    dataType: "array",
    of: {
        dataType: "string",
        previewAsTag: true
    }
});
```

### `validation`

* `required` Si ce champ doit être obligatoire.
* `requiredMessage` Message à afficher comme erreur de validation.
* `unique` La valeur de ce champ doit être unique dans cette collection.
* `uniqueInArray` Si défini à `true`, l'utilisateur ne pourra avoir la valeur de
  cette propriété qu'une seule fois dans le parent
  `ArrayProperty`. Fonctionne sur les propriétés enfants directes ou sur les enfants de premier
  niveau d'un `MapProperty` (si défini comme propriété `.of` de
  l'`ArrayProperty`).
* `length` Définir une longueur requise pour la valeur string.
* `min` Définir une limite de longueur minimale pour la valeur string.
* `max` Définir une limite de longueur maximale pour la valeur string.
* `matches` Fournir une regex arbitraire pour vérifier la valeur.
* `email` Valide la valeur comme une adresse email via une regex.
* `url` Valide la valeur comme une URL valide via une regex.
* `trim` Transforme les valeurs string en supprimant les espaces en début et fin.
* `lowercase` Transforme la valeur string en minuscules.
* `uppercase` Transforme la valeur string en majuscules.

---

En fonction de votre configuration, les widgets de champ de formulaire créés sont :

- [`TextFieldBinding`](../../api/functions/TextFieldBinding) champ de texte générique
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) si les `enumValues`
  sont définies dans la configuration du string, ce champ rend un select
  où chaque option est un chip coloré.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding)
  la propriété a une
  configuration de stockage.
- [`MarkdownEditorFieldBinding.`](../../api/functions/MarkdownEditorFieldBinding) la
  propriété a une
  configuration markdown.

Liens :

- [API](../../api/interfaces/StringProperty)
