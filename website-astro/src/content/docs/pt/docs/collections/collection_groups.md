---
title: Grupos de coleções
sidebar_label: Grupos de coleções
---

Agora você pode usar grupos de coleções Firestore no FireCMS. Isso permite consultar várias coleções com o mesmo nome. Por exemplo, você pode ter um grupo de coleções chamado `products` que contém todos os produtos de diferentes `stores`.

No nosso projeto demo, temos um grupo de coleções chamado `locales` que contém todas as localizações para os diferentes `products`.

Veja o projeto demo [aqui](https://demo.firecms.co/c/locales).

O FireCMS gerará uma coluna adicional na visualização da coleção com referências a todas as coleções pai que fazem parte da configuração.

Para usar grupos de coleções, você deve especificar a propriedade `collectionGroup` na configuração `Collection`.

```tsx
export const localeCollectionGroup = buildCollection({
    name: "Product locales group",
    path: "locales",
    description: "This is a collection group related to the locales subcollection of products",
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
Dependendo das suas regras do Firestore, pode ser necessário adicionar outra regra para permitir consultas em grupos de coleções. Por exemplo:

```text
match /{path=**}/locales/{document=**} {
  allow read, write: if true;
}
```

Ao consultar um grupo de coleções, o caminho será algo como `/products/{productId}/locales/{localeId}`. Mas a consulta irá a todas as coleções chamadas `locales` no seu banco de dados. É por isso que pode ser necessário adicionar uma regra como a acima.
:::
