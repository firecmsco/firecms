---
slug: fr/docs/pro/data_import
title: Import de données
sidebar_label: Import de données
---

![data_import.png](/img/data_import.png)

Le **Plugin d'Import de Données** pour FireCMS vous permet d'importer des données de collection depuis des fichiers JSON, CSV, XLSX (Excel) directement
dans votre application FireCMS. Ces plugins fournissent une interface où les utilisateurs peuvent téléverser des fichiers et mapper les données existantes vers les propriétés de collection. Cela rend très pratique le déplacement de données d'un service à un autre et la conversion des données vers les bons types de données dans la base de données.

Le plugin est capable de faire une conversion automatique de certains types de données comme les dates.

La fonctionnalité d'import peut également être utilisée dans le plugin d'éditeur de collection. Dans l'éditeur de collection, vous pouvez créer de nouvelles collections depuis un fichier de données. Il sera capable de comprendre correctement la structure de vos données et même d'inférer les types comme les dates ou les enums (même s'ils sont stockés sous forme de chaînes).

## Installation

Installez d'abord le package du Plugin d'Import de Données :

```sh
yarn add @firecms/data_import
```

## Configuration

Intégrez le Plugin d'Import de Données en utilisant le hook `useImportPlugin`. Vous pouvez optionnellement fournir des `ImportPluginProps` pour personnaliser son comportement.

### ImportPluginProps

- **`onAnalyticsEvent`** : Callback déclenché sur les événements analytics liés à l'import.
    - **Type** : `(event: string, params?: any) => void`
    - **Défaut** : `undefined`

## Utilisation du hook

Utilisez le hook `useImportPlugin` pour créer le plugin d'import et l'inclure dans la configuration FireCMS.

### Exemple : Intégration du Plugin d'Import de Données

```jsx
import React from "react";
import { CircularProgressCenter, FireCMS, useBuildModeController } from "@firecms/core";
import { useFirebaseStorageSource } from "@firecms/firebase";
import { useImportPlugin } from "@firecms/data_import";

export function App() {

    const importPlugin = useImportPlugin({
        onAnalyticsEvent: (event, params) => {
            console.log(`Import Event: ${event}`, params);
            // Intégrez avec votre service d'analytics si nécessaire
        },
    });


    return (
        <FireCMS
            navigationController={navigationController}
            /*... reste de votre configuration */
        >
          {({ context, loading }) => {
              // ... vos composants
          }}
        </FireCMS>
    );
}

export default App;
```

## Utilisation de la fonctionnalité d'import

Après l'intégration, la fonctionnalité d'import est disponible dans vos vues de collection. Les utilisateurs peuvent téléverser des fichiers JSON ou CSV pour peupler les collections.

### Étapes pour importer des données

1. **Naviguer vers une collection** : Ouvrez la collection souhaitée dans votre application FireCMS.
2. **Initier l'import** : Cliquez sur l'action **Import** dans la barre d'actions de collection.
3. **Téléverser le fichier** : Sélectionnez et téléversez le fichier JSON ou CSV contenant les données.
4. **Mapping des types de données** : Sélectionnez les types de données et comment vos données doivent être mappées à la structure actuelle.
5. **Traitement des données** : Le plugin traite le fichier et ajoute les données à votre collection.

## Types

### `ImportPluginProps`

Définit les propriétés pour le hook `useImportPlugin`.

```typescript
export type ImportPluginProps = {
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
```

### `ImportAllowedParams`

Fournit le contexte pour déterminer les permissions d'import.

```typescript
export type ImportAllowedParams = { 
    collectionEntitiesCount: number; 
    path: string; 
    collection: EntityCollection; 
};
```

## Exemple : Suivi des imports avec Google Analytics

```jsx
const importPlugin = useImportPlugin({
    onAnalyticsEvent: (event, params) => {
        if (window && window.gtag) {
            window.gtag('event', event, params);
        }
    },
});
```
