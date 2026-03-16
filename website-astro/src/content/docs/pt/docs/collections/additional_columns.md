---
slug: pt/docs/collections/additional_columns
title: Colunas/campos adicionais
sidebar_label: Colunas/campos adicionais
---


Se você deseja incluir uma coluna que não mapeia diretamente para uma propriedade, pode usar o campo `additionalFields`, fornecendo um `AdditionalFieldDelegate`, que inclui um id, um título e um builder que recebe a entidade correspondente.

No builder, você pode retornar qualquer Componente React.

:::note
Se o seu campo adicional depende do valor de outra propriedade da entidade, você pode definir a prop `dependencies` como um array de chaves de propriedade para que os dados sejam sempre atualizados.
Isso disparará uma re-renderização sempre que houver uma mudança em qualquer um dos valores de propriedade especificados.
:::

#### Exemplo

```tsx
import {
    buildCollection,
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

#### Exemplo avançado

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
`AsyncPreviewComponent` é um componente utilitário fornecido pelo FireCMS que permite renderizar o resultado de uma computação assíncrona (como buscar dados de uma subcoleção, como neste caso). Enquanto isso, exibirá um indicador de carregamento skeleton.
:::
