---
slug: fr/docs/collections/callbacks
title: Callbacks d'entité
sidebar_label: Callbacks d'entité
---

Lors du travail avec une entité, vous pouvez attacher différents callbacks avant et
après qu'elle soit sauvegardée ou récupérée :
`onFetch`, `onIdUpdate`, `onPreSave`, `onSaveSuccess` et `onSaveFailure`.

Ces callbacks sont définis au niveau de la collection sous la prop `callbacks`.

Le callback `onIdUpdate` peut être utilisé pour mettre à jour l'ID de l'entité avant
de la sauvegarder. C'est utile si vous avez besoin de générer l'ID à partir d'autres champs.

C'est utile si vous avez besoin d'ajouter de la logique ou de modifier certains champs ou l'identifiant de l'entité
avant/après la sauvegarde ou la suppression d'entités.

La plupart des callbacks sont asynchrones.

:::note
Vous pouvez arrêter l'exécution de ces callbacks en lançant une `Error`
contenant une `string` et une notification d'erreur sera affichée.
:::

:::tip
Vous pouvez utiliser l'objet `context` pour accéder au contexte FireCMS.
L'objet `context` contient tous les contrôleurs et services disponibles dans l'application,
y compris `authController`, `dataSource`, `storageSource`, `sideDialogsController`, etc.
:::

```tsx
import {
    buildCollection,
    buildEntityCallbacks,
    EntityOnDeleteProps,
    EntityOnSaveProps,
    EntityOnFetchProps,
    EntityIdUpdateProps,
    toSnakeCase
} from "@firecms/core";

type Product = {
    name: string;
    uppercase_name: string;
}

const productCallbacks = buildEntityCallbacks({
    onPreSave: ({
                    collection,
                    path,
                    entityId,
                    values,
                    previousValues,
                    status
                }) => {
        // retourner les valeurs mises à jour
        values.uppercase_name = values.name?.toUpperCase();
        return values;
    },

    onSaveSuccess: (props: EntityOnSaveProps<Product>) => {
        console.log("onSaveSuccess", props);
    },

    onSaveFailure: (props: EntityOnSaveProps<Product>) => {
        console.log("onSaveFailure", props);
    },

    onPreDelete: ({
                      collection,
                      path,
                      entityId,
                      entity,
                      context
                  }: EntityOnDeleteProps<Product>
    ) => {
        if (!context.authController.user)
            throw Error("Les utilisateurs non connectés ne peuvent pas supprimer des produits");
    },

    onDelete: (props: EntityOnDeleteProps<Product>) => {
        console.log("onDelete", props);
    },

    onFetch({
                collection,
                context,
                entity,
                path,
            }: EntityOnFetchProps) {
        entity.values.name = "Forced name";
        return entity;
    },

    onIdUpdate({
                   collection,
                   context,
                   entityId,
                   path,
                   values
               }: EntityIdUpdateProps): string {
        // retourner l'ID souhaité
        return toSnakeCase(values?.name)
    },
});

const productCollection = buildCollection<Product>({
    name: "Product",
    path: "products",
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        uppercase_name: {
            name: "Uppercase Name",
            dataType: "string",
            disabled: true,
            description: "Ce champ est mis à jour avec un callback preSave"
        }
    },
    callbacks: productCallbacks
});
```

#### EntityOnSaveProps

* `collection` : Collection résolue de l'entité

* `path` : string Chemin complet où cette entité est sauvegardée (peut contenir des alias non résolus)

* `resolvedPath` : string Chemin complet avec l'alias résolu

* `entityId` : string ID de l'entité

* `values` : EntityValues Valeurs en cours de sauvegarde

* `previousValues` : EntityValues Valeurs précédentes de l'entité

* `status` : EntityStatus Entité nouvelle ou existante

* `context` : FireCMSContext Contexte de l'état de l'application

#### EntityOnDeleteProps

* `collection` : Collection résolue de l'entité

* `path` : string Chemin complet où cette entité est sauvegardée

* `entityId` : string ID de l'entité

* `entity` : Entity Entité supprimée

* `context` : FireCMSContext Contexte de l'état de l'application

#### EntityIdUpdateProps

* `collection` : EntityCollection Collection résolue de l'entité

* `path` : string Chemin complet où cette entité est sauvegardée

* `entityId` : string ID de l'entité

* `values` : Valeurs de l'entité

* `context` : FireCMSContext Contexte de l'état de l'application
