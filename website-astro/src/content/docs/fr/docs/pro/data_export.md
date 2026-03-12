---
slug: fr/docs/pro/data_export
title: Export de données
sidebar_label: Export de données
description: Exportez les données de collection vers des fichiers CSV ou JSON avec le plugin d'export FireCMS PRO.
---

![data_export.png](/img/data_export.png)

Le **Plugin d'Export de Données** pour FireCMS vous permet d'exporter les données de collection vers des fichiers CSV ou JSON.
Les utilisateurs peuvent facilement télécharger les données depuis n'importe quelle collection dans un format adapté à un traitement ultérieur.

## Installation

Installez le package du Plugin d'Export de Données :

```sh
yarn add @firecms/data_export
```

## Configuration

Intégrez le Plugin d'Export de Données en utilisant le hook `useExportPlugin`. Vous pouvez optionnellement fournir des `ExportPluginProps` pour personnaliser son comportement.

### ExportPluginProps

- **`exportAllowed`** : Contrôle si l'export est autorisé.
    - **Type** : `(props: ExportAllowedParams) => boolean`
    - **Défaut** : `(props) => true`
- **`notAllowedView`** : Vue à afficher quand l'export n'est pas autorisé.
    - **Type** : `React.ReactNode`
    - **Défaut** : `undefined`
- **`onAnalyticsEvent`** : Callback déclenché sur les événements analytics liés à l'export.
    - **Type** : `(event: string, params?: any) => void`
    - **Défaut** : `undefined`

## Utilisation du hook

Utilisez le hook `useExportPlugin` pour créer le plugin d'export et l'inclure dans la configuration FireCMS.

### Exemple : Intégration du Plugin d'Export de Données

```jsx
import React from "react";
import { CircularProgressCenter, FireCMS, useBuildModeController } from "@firecms/core";
import { useFirebaseStorageSource } from "@firecms/firebase";
import { useExportPlugin } from "@firecms/data_export";

export function App() {

    const exportPlugin = useExportPlugin({
        exportAllowed: ({ collection, path, collectionEntitiesCount }) => {
            // Autoriser l'export pour tous par défaut
            return true;
        },
        onAnalyticsEvent: (event, params) => {
            console.log(`Export Event: ${event}`, params);
        },
    });

    return (
        <FireCMS
            navigationController={navigationController}
            plugins={[exportPlugin]}
            /* ... reste de votre configuration */
        >
            {({ context, loading }) => {
                // ... vos composants
            }}
        </FireCMS>
    );
}

export default App;
```

## Personnalisation

Vous pouvez personnaliser le comportement de la fonctionnalité d'export en fournissant des implémentations personnalisées pour les props `exportAllowed`, `notAllowedView` et `onAnalyticsEvent`.

### Exemple : Restriction de l'export basée sur le rôle utilisateur

```jsx
const exportPlugin = useExportPlugin({
    exportAllowed: ({
                        collection,
                        path,
                        collectionEntitiesCount
                    }) => {
        // Autoriser l'export uniquement pour les administrateurs
        return userRoles.includes('admin');
    },
    notAllowedView: <div>Seuls les administrateurs peuvent exporter des données.</div>,
    onAnalyticsEvent: (event, params) => {
        // Enregistrer les événements d'export pour l'audit
        logAnalytics(event, params);
    },
});
```

## Types

### `ExportPluginProps`

Définit les propriétés qui peuvent être passées au hook `useExportPlugin`.

```typescript
export type ExportPluginProps = {
    exportAllowed?: (props: ExportAllowedParams) => boolean;
    notAllowedView?: React.ReactNode;
    onAnalyticsEvent?: (event: string, params?: any) => void;
}
```

### `ExportAllowedParams`

Fournit le contexte pour déterminer si l'export est autorisé.

```typescript
export type ExportAllowedParams = {
    collectionEntitiesCount: number;
    path: string;
    collection: EntityCollection;
};
```
