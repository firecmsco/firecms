---
title: useStorageSource
sidebar_label: useStorageSource
description: Accédez à la source de stockage FireCMS pour télécharger des fichiers et récupérer des URLs de téléchargement. Fonctionne avec Firebase Storage ou toute implémentation de stockage personnalisée.
---

Utilisez ce hook pour accéder à la source de stockage utilisée dans votre application FireCMS.

Chaque fichier téléchargé dans FireCMS est référencé par une chaîne de la forme
`${path}/${fileName}`, qui est ensuite référencée dans la source de données comme une valeur
string dans les propriétés qui ont une configuration de stockage.

Vous pouvez utiliser ce contrôleur pour télécharger des fichiers et obtenir le chemin de stockage où il
a été stocké. Ensuite, vous pouvez convertir ce storagePath en une URL de téléchargement.

:::note
Veuillez noter que pour utiliser ce hook, vous **devez** être dans
un composant (vous ne pouvez pas l'utiliser directement depuis une fonction callback).
:::

### Méthodes disponibles

* `uploadFile` : Télécharger un fichier, en spécifiant le fichier, le nom et le chemin
* `getDownloadURL` : Convertir un chemin de stockage en URL de téléchargement

### Exemple

```tsx
import React from "react";
import { useStorageSource } from "@firecms/core";
import { Button } from "@firecms/ui";

export function FileUploader() {
    const storageSource = useStorageSource();

    const handleUpload = async (file: File) => {
        const result = await storageSource.uploadFile({
            file,
            fileName: file.name,
            path: "uploads",
        });
        console.log("Fichier téléchargé vers :", result.path);
    };

    return (
        <input
            type="file"
            onChange={(e) => {
                if (e.target.files?.[0]) {
                    handleUpload(e.target.files[0]);
                }
            }}
        />
    );
}
```
