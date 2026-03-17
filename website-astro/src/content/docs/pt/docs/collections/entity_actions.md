---
title: Ações de Entidade
sidebar_label: Ações de Entidade
---

As entidades podem ser editadas, deletadas e duplicadas por padrão.

As ações padrão são habilitadas ou desabilitadas com base nas permissões
do usuário na coleção.

Se você precisar adicionar ações personalizadas, pode fazê-lo definindo-as na
prop `entityActions` da coleção.

Você também pode definir ações de entidade globalmente, e elas estarão disponíveis em todas as coleções.
Isso é útil para ações que não são específicas de uma única coleção, como uma ação "Compartilhar".
Ao definir uma ação de entidade global, você deve fornecer uma propriedade `key` única.

As ações serão mostradas no menu da view de coleção por padrão
e na view de formulário se `includeInForm` for definido como true.

Você pode acessar todos os controllers do FireCMS no `context`. Isso é útil para acessar o datasource,
modificar dados, acessar armazenamento, abrir diálogos, etc.

Na prop `icon`, você pode passar um elemento React para mostrar um ícone ao lado do nome da ação.
Recomendamos usar qualquer um dos [ícones FireCMS](/docs/icons), disponíveis no pacote `@firecms/ui`.

### Definindo ações no nível da coleção

```tsx
import { buildCollection } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Products",
    singularName: "Product",
    icon: "shopping_cart",
    description: "List of the products currently sold in our shop",
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive",
            onClick({
                        entity,
                        collection,
                        context,
                    }): Promise<void> {

                // note que você pode acessar todos os controllers no context
                const dataSource = context.dataSource;

                // Adicione seu código aqui
                return Promise.resolve(undefined);
            }
        }
    ],
    properties: {}
});
````

### Definindo ações globalmente

Você pode definir ações de entidade globalmente passando-as para o componente `FireCMS` se estiver self-hosting,
ou no `FireCMSAppConfig` se estiver usando o FireCMS Cloud.

```tsx
import { ShareIcon } from "@firecms/ui";

// Self-hosted
<FireCMS
    entityActions={[{
        key: "share",
        name: "Share",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Sua lógica de compartilhamento aqui
        }
    }]}
    {...otherProps}
/>
```

```tsx
import { ShareIcon } from "@firecms/ui";

// FireCMS Cloud
const appConfig: FireCMSAppConfig = {
    entityActions: [{
        key: "share",
        name: "Share",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Sua lógica de compartilhamento aqui
        }
    }],
    // ...outras configurações
};
```

#### EntityAction

* `name`: Nome da ação
* `key`?: Chave da ação. Você só precisa fornecer isso se quiser sobrescrever as ações padrão, ou se estiver definindo a ação globalmente.
  As ações padrão são:
  * `edit`
  * `delete`
  * `copy`
* `icon`?: React.ReactElement Ícone da ação
* `onClick`: (props: EntityActionClickProps) => Promise
  Função a ser chamada quando a ação for clicada
* `collapsed`?: boolean Mostrar esta ação recolhida no menu da view de coleção. Padrão true.
* `includeInForm`?: boolean Mostrar esta ação no formulário, padrão true
* `disabled`?: boolean Desabilitar esta ação, padrão false

#### EntityActionClickProps

* `entity`: Entidade sendo editada
* `context`: FireCMSContext, usado para acessar todos os controllers
* `fullPath`?: string
* `fullIdPath`?: string
* `collection`?: EntityCollection
* `formContext`?: FormContext, presente se a ação estiver sendo chamada de um formulário.
* `selectionController`?: SelectionController
* `highlightEntity`?: (entity: Entity) => void
* `unhighlightEntity`?: (entity: Entity) => void
* `onCollectionChange`?: () => void
* `sideEntityController`?: SideEntityController
* `view`: "collection" | "form"
* `openEntityMode`: "side_panel" | "full_screen"
* `navigateBack`?: () => void

## Exemplos

Vamos criar um exemplo onde adicionamos uma ação para arquivar um produto.
Quando a ação for clicada, chamaremos uma Google Cloud Function que executará alguma lógica de negócio no backend.

### Usando a API `fetch`

Você pode usar a API `fetch` padrão para chamar qualquer endpoint HTTP, incluindo uma Google Cloud Function.

```tsx
import { buildCollection, Product } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // outras propriedades
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive",
            collapsed: false,
            onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                return fetch("[YOUR_ENDPOINT]/archiveProduct", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        productId: entity.id
                    })
                }).then(() => {
                    snackbarController.open({
                        message: "Product archived",
                        type: "success"
                    });
                }).catch((error) => {
                    snackbarController.open({
                        message: "Error archiving product",
                        type: "error"
                    });
                });
            }
        }
    ],
});
```

### Usando o Firebase Functions SDK

Se você estiver usando o Firebase, a abordagem recomendada é usar o SDK do Firebase Functions.

```tsx
import { getFunctions, httpsCallable } from "firebase/functions";
import { ArchiveIcon } from "@firecms/ui";
import { buildCollection, Product } from "@firecms/core";

const functions = getFunctions();
const archiveProductCallable = httpsCallable(functions, 'archiveProduct');

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // outras propriedades
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archive with Firebase",
            collapsed: false,
            async onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                try {
                    await archiveProductCallable({ productId: entity.id });
                    snackbarController.open({
                        message: "Product archived successfully",
                        type: "success"
                    });
                } catch (error) {
                    console.error("Error archiving product:", error);
                    snackbarController.open({
                        message: "Error archiving product: " + error.message,
                        type: "error"
                    });
                }
            }
        }
    ],
});
```
