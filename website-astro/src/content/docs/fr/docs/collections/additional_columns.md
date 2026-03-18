---
title: Colonnes/champs supplémentaires
slug: fr/docs/collections/additional_columns
sidebar_label: Colonnes/champs supplémentaires
---


Si vous souhaitez inclure une colonne qui ne correspond pas directement à une propriété,
vous pouvez utiliser le champ `additionalFields` en fournissant un
`AdditionalFieldDelegate`, qui inclut un id, un titre et un constructeur qui
reçoit l'entité correspondante.

Dans le constructeur, vous pouvez retourner n'importe quel composant React.

:::note
Si votre champ supplémentaire dépend de la valeur d'une autre propriété de l'entité,
vous pouvez définir la prop `dependencies` comme un tableau de clés de propriétés afin que
les données soient toujours mises à jour.
Cela déclenchera un nouveau rendu chaque fois qu'il y a un changement dans l'une des valeurs de propriété spécifiées.
:::

#### Exemple

```tsx
import {
    buildCollection,
    AdditionalFieldDelegate
} from "@firecms/core";

type User = { name: string }

export const fullNameAdditionalField: AdditionalFieldDelegate<User> = {
    key: "full_name",
    name: "Full Name",
    Builder: ({ entity }) => {
        let values = entity.values;
        return typeof values.name === "string" ? values.name.toUpperCase() : "No name provided";
    },
    dependencies: ["name"]
};

const usersCollection = buildCollection<User>({
    path: "users",
    name: "User",
    properties: {
        name: { dataType: "string", name: "Name" }
    },
    additionalFields: [
        fullNameAdditionalField
    ]
});
```

#### Exemple avancé

```tsx
import {
    buildCollection,
    AdditionalFieldDelegate,
    AsyncPreviewComponent
} from "@firecms/core";

export const productAdditionalField: AdditionalFieldDelegate<Product> = {
    key: "spanish_title",
    name: "Spanish title",
    Builder: ({ entity, context }) =>
        <AsyncPreviewComponent builder={
            context.dataSource.fetchEntity({
                path: entity.path,
                entityId: entity.id,
                collection: localeSchema
            }).then((entity) => entity.values.name)
        }/>
};
```

:::tip
`AsyncPreviewComponent` est un composant utilitaire fourni par FireCMS qui
permet de rendre le résultat d'un calcul asynchrone (comme la récupération de données
depuis une sous-collection, comme dans ce cas). Il affichera un indicateur de chargement squelette entre-temps.
:::
