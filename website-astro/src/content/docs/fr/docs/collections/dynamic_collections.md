---
slug: fr/docs/collections/dynamic_collections
title: Collections dynamiques
sidebar_label: Collections dynamiques
description: Débloquez une gestion de contenu personnalisée avec les Collections Dynamiques dans FireCMS, où les collections peuvent s'adapter au profil de l'utilisateur connecté grâce à des callbacks asynchrones.
---

FireCMS offre la possibilité de définir des collections dynamiquement. Cela signifie
que les collections peuvent être construites de façon asynchrone, basées sur l'utilisateur connecté,
basées sur les données d'autres collections, ou basées sur toute autre condition arbitraire.

Au lieu de définir vos collections comme un tableau, utilisez un `EntityCollectionsBuilder`,
une fonction qui retourne une promesse d'un objet contenant les collections.

```tsx
import { EntityCollectionsBuilder } from "@firecms/core";

// ...

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) =>
    ({
        collections: [
            buildCollection({
                path: "products",
                properties: {}, // ...
                name: "Products"
            })
        ]
    });
```

:::note
Si vous souhaitez uniquement faire des personnalisations au niveau des propriétés, consultez la
section [champs conditionnels](../properties/conditional_fields). Mais notez que les champs conditionnels ne sont pas
adaptés aux opérations asynchrones.
:::

### Récupérer des données d'une collection différente

Il peut arriver qu'une configuration de collection dépende des données d'une
autre collection. Par exemple, vous pourriez vouloir récupérer les valeurs d'enum d'une propriété depuis
une collection différente.

Dans cet exemple, nous allons récupérer des données d'une collection appelée `categories` et
les utiliser pour remplir les valeurs d'enum d'une propriété appelée `category`, dans la collection `products`.

```tsx
import { useCallback } from "react";
import { buildCollection, EntityCollectionsBuilder } from "@firecms/core";

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {

    // supposons que vous avez une collection de base de données appelée "categories"
    const categoriesData: Entity<any>[] = await dataSource.fetchCollection({
        path: "categories"
    });

    return {
        collections: [
            buildCollection({
                id: "products",
                path: "products",
                properties: {
                    // ...
                    category: {
                        dataType: "string",
                        name: "Category",
                        // nous pouvons utiliser la propriété enumValues pour définir les valeurs d'enum
                        // la valeur stockée sera l'id de la catégorie
                        // et le label de l'interface sera le nom de la catégorie
                        enumValues: categoriesData.map((category: any) => ({
                            id: category.id,
                            label: category.values.name
                        }))
                    }
                    // ...
                },
                name: "Products"
            })
        ]
    }
};

```

### Utilisation en conjonction avec l'authentification

Le `AuthController` gère l'état d'authentification. Il peut également être utilisé pour stocker tout
objet arbitraire lié à l'utilisateur.

Un cas d'utilisation typique est de stocker des données supplémentaires liées à l'utilisateur, par
exemple, les rôles ou les permissions.

```tsx
import { useCallback } from "react";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                            user,
                                                                            authController
                                                                        }) => {

    if (user?.email?.includes("flanders")) {
        throw Error("Stupid Flanders!");
    }

    console.log("Allowing access to", user?.email);
    // Ceci est un exemple de récupération de données asynchrones liées à l'utilisateur
    // et de stockage dans le champ extra du contrôleur.
    const sampleUserRoles = await Promise.resolve(["admin"]);
    authController.setExtra(sampleUserRoles);

    return true;
}, []);
```

Ensuite, vous pouvez accéder aux données extra dans le callback `collectionsBuilder`.

```tsx
const collectionsBuilder: EntityCollectionsBuilder = useCallback(async ({
                                                                            user,
                                                                            authController,
                                                                            dataSource
                                                                        }) => {

    const userRoles = authController.extra;

    if (userRoles?.includes("admin")) {
        return {
            collections: [
                buildCollection({
                    path: "products",
                    properties: {}, // ...
                    name: "Products"
                })
            ]
        };
    } else {
        return {
            collections: []
        };
    }
}, []);
```

### Où utiliser le `collectionsBuilder`

Dans la **version Cloud** de FireCMS, ajoutez simplement le `collectionsBuilder` à la prop `collections` de la configuration principale de votre application.

```tsx

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {
    return {
        collections: [] // vos collections ici
    };
};

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: collectionsBuilder
};
```

Dans la **version PRO** de FireCMS, vous pouvez utiliser le `collectionsBuilder` dans le hook `useBuildNavigationController`.

```tsx
const navigationController = useBuildNavigationController({
    collections: collectionsBuilder
});
```
