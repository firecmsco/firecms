---
title: Views de Entidade
sidebar_label: Views de Entidade
description: O FireCMS permite que você adicione views personalizadas por entidade. Seja criando prévias, visualizações de páginas web, dashboards, alterações de formulário, ou qualquer view distinta, as Entity Custom Views do FireCMS atendem aos seus requisitos únicos.
---

![Custom entity view](/img/entity_view.png)

O FireCMS oferece campos de formulário e tabela padrão para casos de uso comuns e também permite
substituir campos se você precisar de uma implementação personalizada, mas isso pode não ser
suficiente em certos casos, onde você pode querer ter uma **view personalizada completa relacionada
a uma entidade**.

Casos de uso típicos para isso são:

- **Prévia** de uma entidade em um formato específico.
- Verificar como os dados aparecem em uma **página web**.
- Definir um **dashboard**.
- Modificar o estado do **formulário**.
- ... ou qualquer outra view personalizada que você precise.

Quando sua view de entidade estiver definida, você pode adicioná-la diretamente à coleção
ou incluí-la no registro de views de entidade.

### Definindo uma view personalizada de entidade

Para isso, você pode passar um array de `EntityCustomView`
ao seu schema. Como neste exemplo:

```tsx
import React from "react";
import { EntityCustomView, buildCollection } from "@firecms/core";

const sampleView: EntityCustomView = {
    key: "preview",
    name: "Blog entry preview",
    Builder: ({
                  collection,
                  entity,
                  modifiedValues,
                  formContext
              }) => (
        // Este é um componente personalizado que você pode construir como qualquer componente React
        <MyBlogPreviewComponent entity={entity}
                                modifiedValues={modifiedValues}/>
    )
};
```

### Construindo um formulário secundário

![Custom entity view](/img/entity_view_secondary_form.png)

Nas suas views personalizadas, você também pode adicionar campos que são mapeados diretamente para a entidade.
Isso é útil se você quiser adicionar um formulário secundário à sua view de entidade.

Você pode adicionar qualquer campo usando o componente `PropertyFieldBinding`. Este componente
vinculará o valor à entidade, e ele será salvo quando a entidade for salva.

Neste exemplo estamos criando um formulário secundário com um campo map, incluindo nome e idade:

```tsx
import { EntityCustomViewParams, PropertyFieldBinding } from "@firecms/core";
import { Container } from "@firecms/ui";

export function SecondaryForm({
                                  formContext
                              }: EntityCustomViewParams) {

    return (
        <Container className={"my-16"}>
            <PropertyFieldBinding context={formContext}
                                  propertyKey={"myTestMap"}
                                  property={{
                                      dataType: "map",
                                      name: "My test map",
                                      properties: {
                                          name: {
                                              name: "Name",
                                              dataType: "string",
                                              validation: { required: true }
                                          },
                                          age: {
                                              name: "Age",
                                              dataType: "number",
                                          }
                                      }
                                  }}/>
        </Container>
    );
}
```

Depois basta adicionar sua view personalizada à coleção:

```tsx
export const testCollection = buildCollection<any>({
    id: "users",
    path: "users",
    name: "Users",
    properties: {
        // ... suas propriedades do blog aqui
    },
    entityViews: [{
        key: "user_details",
        name: "Details",
        includeActions: true, // esta prop permite incluir as ações padrão na barra inferior
        Builder: SecondaryForm
    }]
});
```

Note que você pode usar a prop `includeActions` para incluir as ações padrão na barra inferior da view,
para que o usuário não precise voltar à view de formulário principal para realizar ações como salvar ou deletar a entidade.


### Adicionar sua view de entidade diretamente à coleção

Se você está editando uma coleção em código, pode adicionar sua view personalizada
diretamente à coleção:

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    entityViews: [
        {
            key: "preview",
            name: "Blog entry preview",
            Builder: ({
                          collection,
                          entity,
                          modifiedValues
                      }) => (
                // Este é um componente personalizado que você pode construir como qualquer componente React
                <MyBlogPreviewComponent entity={entity}
                                        modifiedValues={modifiedValues}/>
            )
        }
    ],
    properties: {
        // ... suas propriedades do blog aqui
    }
});
```

### Adicionar sua view de entidade ao registro de views de entidade

Você pode ter uma view de entidade que deseja reutilizar em diferentes coleções.

#### FireCMS Cloud

No FireCMS Cloud, você pode adicioná-la ao registro de views de entidade no seu
export principal `FireCMSAppConfig`:

```tsx
import { FireCMSAppConfig } from "@firecms/core";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... suas coleções aqui
        ]);
    },
    entityViews: [{
        key: "test-view",
        name: "Test",
        Builder: ({
                      collection,
                      entity,
                      modifiedValues
                  }) => <div>Sua view</div>
    }]
}

export default appConfig;
```

#### FireCMS PRO

No FireCMS PRO, você pode adicioná-la ao registro de views de entidade no seu componente principal
`FireCMS`:

```tsx
//...
<FireCMS
    //...
    entityViews={[{
        key: "test-view",
        name: "Test",
        Builder: ({
                      collection,
                      entity,
                      modifiedValues
                  }) => <div>Sua view</div>
    }]}
    //...
/>
```

#### Usando view registrada

Isso tornará a view de entidade disponível no editor de UI de coleções.
Também é possível usar a prop `entityView` na coleção
com a chave da view de entidade que você deseja usar:

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    entityViews: ["test-view"],
    properties: {
        // ... suas propriedades do blog aqui
    }
});
```
