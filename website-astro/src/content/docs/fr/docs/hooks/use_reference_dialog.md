---
slug: fr/docs/hooks/use_reference_dialog
title: useReferenceDialog
sidebar_label: useReferenceDialog
---

:::note
Veuillez noter que pour utiliser ce hook, vous **devez** être dans un
composant (vous ne pouvez pas l'utiliser directement depuis une fonction callback).
:::

## `useReferenceDialog`

Ce hook est utilisé pour ouvrir un dialogue latéral qui permet la sélection d'entités
sous un chemin donné. Vous pouvez l'utiliser dans des vues personnalisées pour sélectionner des entités.
Vous devez spécifier au moins le chemin de la collection cible. Si votre collection
n'est pas définie dans la configuration principale des collections
(dans votre composant `FireCMS`), vous devez la spécifier explicitement. C'est le même
hook utilisé en interne lorsqu'une propriété de référence est définie.

Les propriétés fournies par ce hook sont :

*     multiselect?: boolean;
  Autoriser la sélection multiple de valeurs

*     collection?: EntityCollection;
  Configuration de la collection d'entités

*     path: string;
  Chemin absolu de la collection.
  Peut ne pas être défini si ce hook est utilisé dans un composant et que le chemin est
  dynamique. S'il n'est pas défini, le dialogue ne s'ouvrira pas.

*     selectedEntityIds?: string[];
  Si vous ouvrez le dialogue pour la première fois, vous pouvez sélectionner certains
  identifiants d'entités à afficher en premier.

*     onSingleEntitySelected?(entity: Entity | null): void;
  Si `multiselect` est défini sur `false`, vous obtiendrez l'entité sélectionnée
  dans ce callback.

*     onMultipleEntitiesSelected?(entities: Entity[]): void;
  Si `multiselect` est défini sur `false`, vous obtiendrez les entités sélectionnées
  dans ce callback.

*     onClose?(): void;
  Si le dialogue est actuellement ouvert, le fermer

*     forceFilter?: FilterValues;
  Autoriser la sélection uniquement des entités qui passent le filtre donné.

Exemple :

```tsx
import React from "react";
import { useReferenceDialog, useSnackbarController, Entity } from "@firecms/core";
import { Button } from "@firecms/ui";

type Product = {
    name: string;
    price: number;
};

export function ExampleCMSView() {

    // hook pour afficher des snackbars personnalisés
    const snackbarController = useSnackbarController();

    // hook pour ouvrir un dialogue de référence
    const referenceDialog = useReferenceDialog({
        path: "products",
        onSingleEntitySelected(entity: Entity<Product> | null) {
            snackbarController.open({
                type: "success",
                message: "Sélectionné : " + entity?.values.name
            })
        }
    });

    return <Button
        onClick={referenceDialog.open}
        color="primary">
        Tester le dialogue de référence
    </Button>;
}
```
