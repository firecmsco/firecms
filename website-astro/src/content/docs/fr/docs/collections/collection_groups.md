---
slug: fr/docs/collections/collection_groups
title: Groupes de collections
sidebar_label: Groupes de collections
---

Vous pouvez maintenant utiliser les groupes de collections Firestore dans FireCMS. Cela vous permet de
faire des requêtes sur plusieurs collections portant le même nom. Par exemple, vous pourriez
avoir un groupe de collections appelé `products` qui contient tous les produits
de différents `stores`.

Dans notre projet de démonstration, nous avons un groupe de collections appelé `locales` qui
contient toutes les locales pour les différents `products`.

Voir le projet de démonstration [ici](https://demo.firecms.co/c/locales).

FireCMS générera une colonne supplémentaire dans la vue de collection
avec des références à toutes les collections parentes qui font partie de la
configuration.

Pour utiliser les groupes de collections, vous devez spécifier la propriété `collectionGroup`
dans la configuration `Collection`.

```tsx
export const localeCollectionGroup = buildCollection({
    name: "Product locales group",
    path: "locales",
    description: "Ceci est un groupe de collections lié à la sous-collection locales des produits",
    collectionGroup: true,
    properties: {
        name: {
            name: "Name",
            validation: { required: true },
            dataType: "string"
        },
        // ...
    },
});
```

:::note
Selon vos règles Firestore, vous pourriez avoir besoin d'ajouter une
règle pour autoriser les requêtes de groupe de collections. Par exemple :

```text
match /{path=**}/locales/{document=**} {
  allow read, write: if true;
}
```

Lors d'une requête de groupe de collections, le chemin ressemblera à
`/products/{productId}/locales/{localeId}`. Mais la requête ira à toutes
les collections appelées `locales` dans votre base de données. C'est pourquoi vous pourriez avoir besoin
d'ajouter une règle comme celle ci-dessus.
:::
