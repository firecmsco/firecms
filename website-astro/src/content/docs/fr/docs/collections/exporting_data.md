---
title: Exporter des données
slug: fr/docs/collections/exporting_data
sidebar_label: Exporter des données
---

Chaque vue de collection est exportable par défaut et inclura un bouton pour
exporter les données au format `csv`.

Vous pouvez désactiver la fonction d'exportation en définissant le paramètre `exportable`
dans votre collection à `false`.

Toutes les colonnes standard sont exportées, mais pas les champs supplémentaires que vous
avez configurés dans votre vue de collection, car vous pouvez les construire avec n'importe quel composant React.

Si vous avez besoin d'ajouter des champs supplémentaires dans votre fichier d'exportation, vous pouvez les créer
en définissant un `ExportConfig` dans votre prop `exportable` :

```tsx
import { ExportMappingFunction, buildCollection } from "@firecms/core";

export const sampleAdditionalExportColumn: ExportMappingFunction = {
    key: "extra",
    builder: async ({ entity }) => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return "Additional exported value " + entity.id;
    }
};

const blogCollection = buildCollection({
    path: "blog",
    collection: blogCollection,
    name: "Blog",
    exportable: {
        additionalFields: [sampleAdditionalExportColumn]
    },
});
```
