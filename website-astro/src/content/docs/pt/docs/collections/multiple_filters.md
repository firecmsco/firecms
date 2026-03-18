---
title: Filtros múltiplos nas visualizações de coleção
slug: pt/docs/collections/multiple_filters
sidebar_label: Filtros múltiplos
---

O Firestore tem algumas limitações com filtragem e ordenação, limitado a uma única cláusula `where` por consulta por padrão. Isso significa que filtrar por múltiplos campos não é possível nativamente. Esta é uma limitação do Firestore, não do FireCMS.

:::important
A partir do FireCMS 3.0, se você não definir os índices manualmente, o FireCMS tentará executar sua consulta mesmo assim; se falhar, mostrará um link para o console do Firestore para criar os índices necessários.
:::

Se você deseja limitar as operações de UI que podem ser realizadas em uma coleção, com base nos seus índices existentes, pode defini-los no FireCMS usando um `FirestoreIndexesBuilder`. Este é um builder que permite declarar seus índices do Firestore.
Se você definir seus índices, o FireCMS permitirá apenas filtrar pelos campos que você definiu, ou campos que podem ser filtrados e ordenados sem índices.

:::note
O Firestore e o FireCMS permitem algumas consultas sem índices, mas são limitadas.
Por exemplo, você pode filtrar por um único campo, ou por múltiplos campos se estiver
filtrando por igualdade (mas não outros operadores como `>`, `<`, `>=`, `<=`).
Consulte a [documentação do Firestore](https://firebase.google.com/docs/firestore/query-data/indexing)
:::


Este é um exemplo de como você pode definir um `FirestoreIndexesBuilder`. Depois, pode retornar um array de índices que serão usados para filtrar a coleção.

```tsx
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// Builder de índices que permite filtragem por `category` e `available` para a coleção `products`
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
        // Para 2 campos, você precisa definir 4 índices (eu sei...)
        return [
            {
                category: "asc",
                available: "desc"
            },
            {
                category: "asc",
                available: "asc"
            },
            {
                category: "desc",
                available: "desc"
            },
            {
                category: "desc",
                available: "asc"
            }
        ];
    }
    return undefined;
}

```


## Adicionar seus índices no FireCMS self-hosted

```tsx
import { FirestoreIndexesBuilder, useFirestoreDelegate } from "@firecms/firebase";

// ...

    // Builder de índices de exemplo
    const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
        if (path === "products") {
            return [
                {
                    category: "asc",
                    available: "desc"
                },
                {
                    category: "asc",
                    available: "asc"
                },
                {
                    category: "desc",
                    available: "desc"
                },
                {
                    category: "desc",
                    available: "asc"
                }
            ];
        }
        return undefined;
    }

    // Delegado usado para buscar e salvar dados no Firestore
    const firestoreDelegate = useFirestoreDelegate({
        // ...
        firestoreIndexesBuilder
    });
    
    // ...
```


## Adicionar seus índices no FireCMS Cloud

```tsx
import { FireCMSCloudApp } from "@firecms/cloud";
import { FirestoreIndexesBuilder } from "@firecms/firebase";

// Builder de índices de exemplo
const firestoreIndexesBuilder: FirestoreIndexesBuilder = ({ path }) => {
    if (path === "products") {
        return [
            {
                category: "asc",
                available: "desc"
            },
            {
                category: "asc",
                available: "asc"
            },
            {
                category: "desc",
                available: "desc"
            },
            {
                category: "desc",
                available: "asc"
            }
        ];
    }
    return undefined;
}

// Adiciona seu builder de índices à sua aplicação
function MyApp() {

    return <FireCMSCloudApp
        // ...
        firestoreIndexesBuilder={firestoreIndexesBuilder}
        // ...
    />;
}
```
