---
slug: fr/docs/properties/fields/file_upload
title: Téléversement de fichiers (File upload)
---

Utilisez les champs de téléversement de fichiers pour permettre aux utilisateurs de téléverser des images, des documents ou tout fichier vers votre solution de stockage (Firebase Storage par défaut). Ce champ gère le téléversement du fichier et enregistre le chemin de stockage comme valeur de votre propriété.

:::note
Vous pouvez enregistrer l'URL du fichier téléversé, plutôt que le chemin de stockage, en utilisant la prop `storeUrl`. Voir la configuration complète de la propriété de stockage pour plus de détails.
:::

Vous pouvez personnaliser le nom de fichier des fichiers téléversés en utilisant la prop `fileName` dans la configuration du stockage. Vous pouvez utiliser les éléments suivants dans le modèle de nom de fichier :
- \{file.name\} - Nom du fichier sans extension
- \{file.ext\} - Extension du fichier
- \{rand\} - Valeur aléatoire pour éviter les collisions de noms
- \{entityId\} - ID de l'entité
- \{propertyKey\} - ID de cette propriété
- \{path\} - Chemin de cette entité

### Téléversement de fichier unique

![Field](/img/fields/File_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Image",
    storage: {
        storagePath: "images",
        acceptedFiles: ["image/*"],
        maxSize: 1024 * 1024,
        metadata: {
            cacheControl: "max-age=1000000"
        },
        fileName: (context) => {
            return context.file.name;
        }
    }
});
```

Le type de données est [`string`](../config/string).

En interne, le composant utilisé est [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).

### Téléversement de fichiers multiples

![Field](/img/fields/Multi_file_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Images",
    of: {
        dataType: "string",
        storage: {
            storagePath: "images",
            acceptedFiles: ["image/*"],
            metadata: {
                cacheControl: "max-age=1000000"
            }
        }
    },
    description: "This fields allows uploading multiple images at once"
});
```

Le type de données est [`array`](../config/array).

En interne, le composant utilisé est [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).

### Support personnalisé pour les images, vidéos et audio

Vous êtes libre d'utiliser la propriété `storage` pour téléverser n'importe quel type de fichier, mais FireCMS fournit également un support personnalisé pour les images, vidéos et audio.

Vous n'avez pas besoin d'effectuer des modifications spécifiques et ce comportement est activé par défaut. FireCMS détectera automatiquement si le fichier est une image, une vidéo ou un audio et affichera l'aperçu en conséquence.

Les types MIME supportés pour les aperçus personnalisés sont :

- `image/*`
- `video/*`
- `audio/*`

(cela inclut tous les formats de fichiers liés à ces catégories)
