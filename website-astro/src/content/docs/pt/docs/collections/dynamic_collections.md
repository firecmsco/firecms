---
title: Coleções dinâmicas
slug: pt/docs/collections/dynamic_collections
sidebar_label: Coleções dinâmicas
description: Desbloqueie o gerenciamento de conteúdo personalizado com Coleções Dinâmicas no FireCMS, onde as coleções podem se adaptar ao perfil do usuário logado usando callbacks assíncronos.
---

O FireCMS oferece a possibilidade de definir coleções dinamicamente. Isso significa
que as coleções podem ser construídas de forma assíncrona, com base no usuário logado,
com base nos dados de outras coleções, ou com base em qualquer outra condição arbitrária.

Em vez de definir suas coleções como um array, use um `EntityCollectionsBuilder`,
uma função que retorna uma promise de um objeto contendo as coleções.

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
Se você quiser fazer personalizações apenas no nível da propriedade, veja a
seção [campos condicionais](../properties/conditional_fields). Note que campos condicionais não
são adequados para operações assíncronas.
:::

### Buscar dados de outra coleção

Pode ser que uma configuração de coleção dependa dos dados de outra
coleção. Por exemplo, você pode querer buscar os valores enum de uma propriedade de
uma coleção diferente.

Neste exemplo vamos buscar dados de uma coleção chamada `categories` e
usá-los para popular os valores enum de uma propriedade chamada `category`, na coleção `products`.

```tsx
import { useCallback } from "react";
import { buildCollection, EntityCollectionsBuilder } from "@firecms/core";

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {

    // vamos supor que você tem uma coleção de banco de dados chamada "categories"
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
                        // podemos usar a propriedade enumValues para definir os valores enum
                        // o valor armazenado será o id da categoria
                        // e o rótulo da UI será o nome da categoria
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

### Usar em conjunto com autenticação

O `AuthController` gerencia o estado de autenticação. Ele também pode ser usado para armazenar qualquer
objeto arbitrário relacionado ao usuário.

Um caso de uso típico é armazenar alguns dados adicionais relacionados ao usuário, por
exemplo, os papéis ou as permissões.

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
    // Este é um exemplo de recuperação de dados assíncronos relacionados ao usuário
    // e armazenamento no campo extra do controller.
    const sampleUserRoles = await Promise.resolve(["admin"]);
    authController.setExtra(sampleUserRoles);

    return true;
}, []);
```

Então você pode acessar os dados extra no callback `collectionsBuilder`.

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

### Onde usar o `collectionsBuilder`

Na **versão Cloud** do FireCMS, basta adicionar o `collectionsBuilder` à prop `collections` do seu app config principal.

```tsx

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {
    return {
        collections: [] // suas coleções aqui
    };
};

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: collectionsBuilder
};
```

Na **versão PRO** do FireCMS, você pode usar o `collectionsBuilder` no hook `useBuildNavigationController`.

```tsx
const navigationController = useBuildNavigationController({
    collections: collectionsBuilder
});
```
