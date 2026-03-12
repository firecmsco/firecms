---
slug: fr/docs/pro/collection_editor
title: Interface de l'éditeur de collection
sidebar_label: Éditeur de collection
description: L'éditeur de collection FireCMS PRO vous permet de créer et de modifier des collections directement depuis l'interface utilisateur, sans avoir à modifier le code.
---

L'Éditeur de Collection est une fonctionnalité puissante de FireCMS PRO qui vous permet de créer et modifier
des collections directement depuis l'interface utilisateur, sans avoir à modifier votre code.

## Fonctionnalités

- **Création de collection** : Créez de nouvelles collections definissant les propriétés et le sous-schéma approprié.
- **Modification de collection** : Modifiez les collections existantes, renommez-les, ou ajoutez des propriétés.
- **Éditeur de propriété** : Ajoutez, modifiez ou supprimez des propriétés dans vos collections.
- **Formulaire d'aperçu** : Prévisualisez le formulaire d'entité résultant en temps réel.
- **Génération de types** : Le plugin peut générer automatiquement des types TypeScript depuis votre schéma.

## Configuration

Pour utiliser l'éditeur de collection dans FireCMS PRO, vous devez configurer le plugin :

```tsx
import { useCollectionEditorPlugin } from "@firecms/collection_editor";
import { useCollectionEditorFirestoreController } from "@firecms/collection_editor_firebase";

// ...

const collectionConfigController = useCollectionEditorFirestoreController({
    firebaseApp
});

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
});
```

## Utilisation dans FireCMS PRO

```tsx
<FireCMS
    // ...
    plugins={[collectionEditorPlugin]}
/>
```

## Inference de schéma

FireCMS PRO peut inférer le schéma de vos collections depuis les données existantes dans Firestore.
Cela est utile quand vous avez déjà des données dans Firestore et que vous souhaitez créer la configuration de collection correspondante.

```tsx
import { buildCollectionInference } from "@firecms/schema_inference";

const collectionEditorPlugin = useCollectionEditorPlugin({
    collectionConfigController,
    collectionInference: buildCollectionInference(firebaseApp),
});
```
