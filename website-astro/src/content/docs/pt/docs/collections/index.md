---
title: Coleções
sidebar_label: Coleções
description: Defina seu schema de dados do Firestore com as coleções do FireCMS. Crie painéis de administração type-safe para Firebase com React e TypeScript.
---

**Coleções** são os blocos de construção fundamentais do seu **painel de administração** FireCMS. Elas definem como seus **dados do Firestore** são exibidos, editados e gerenciados na interface CMS.

Se você está construindo um **CMS headless** ou um **back-office** para seu projeto **Firebase**, as coleções são onde você define:
- **Quais dados** os usuários podem gerenciar (produtos, usuários, artigos, pedidos, etc.)
- **Como esses dados aparecem** em formulários e tabelas (tipos de campo, validação, layout)
- **Quem pode fazer o quê** (permissões de criar, ler, atualizar, deletar)
- **Lógica personalizada** (callbacks ao salvar, campos calculados, efeitos colaterais)

:::tip[Por que usar coleções do FireCMS?]
Ao contrário dos CMSs tradicionais que impõem um modelo de dados rígido, as coleções do FireCMS mapeiam diretamente para sua estrutura **Firestore** existente. Isso significa que você pode adicionar uma poderosa **UI de administração baseada em React** a qualquer projeto Firebase sem migrar seus dados ou alterar seu schema.
:::

As coleções aparecem no **nível superior** da navegação (página inicial e drawer), ou como **subcoleções** aninhadas sob entidades pai.

Você pode definir coleções de duas formas:
- **No-code**: Use o **Editor de UI de Coleções** integrado (requer permissões adequadas)
- **Code-first**: Defina coleções programaticamente com suporte completo a **TypeScript** e acesso a todos os recursos avançados (callbacks, campos personalizados, propriedades calculadas)

## Definindo suas coleções

Você pode criar suas coleções **na UI ou usando código**. Você também pode misturar as duas abordagens, mas lembre-se de que as coleções definidas na UI terão precedência. Por exemplo, você pode ter uma propriedade enum com 2 valores definidos no código e um valor extra definido na UI. Quando mesclados, o enum resultante terá 3 valores.

:::important
Você pode ter a mesma coleção definida de ambas as formas. Nesse caso, a coleção definida na UI terá precedência.

Uma mesclagem profunda é realizada, portanto você pode definir algumas propriedades no código e sobrescrevê-las na UI. Por exemplo, você pode definir uma propriedade de string enum e os valores serão mesclados de ambas as definições.
:::

### Exemplo de coleção definida em código

:::note
O FireCMS fornece cerca de 20 campos diferentes (como campos de texto, selects e campos complexos como referência ou campos de array ordenáveis). Se seu caso de uso não for coberto por um dos campos fornecidos, você pode criar seu próprio [campo personalizado](../properties/custom_fields.mdx).
:::

:::tip
Você não precisa usar `buildCollection` ou `buildProperty` para construir a configuração. Elas são funções identidade que ajudarão você a detectar erros de tipo e configuração.
:::

```tsx
import { buildCollection, buildProperty, EntityReference } from "@firecms/core";

type Product = {
  name: string;
  main_image: string;
  available: boolean;
  price: number;
  related_products: EntityReference[];
  publisher: {
    name: string;
    external_id: string;
  }
}

const productsCollection = buildCollection<Product>({
  id: "products",
  path: "products",
  name: "Products",
  group: "Main",
  description: "List of the products currently sold in our shop",
  textSearchEnabled: true,
  openEntityMode: "side_panel",
  properties: {
    name: buildProperty({
      dataType: "string",
      name: "Name",
      validation: { required: true }
    }),
    main_image: buildProperty({
      dataType: "string",
      name: "Image",
      storage: {
        mediaType: "image",
        storagePath: "images",
        acceptedFiles: ["image/*"],
        metadata: {
          cacheControl: "max-age=1000000"
        }
      },
      description: "Upload field for images",
      validation: {
        required: true
      }
    }),
    available: buildProperty({
      dataType: "boolean",
      name: "Available",
      columnWidth: 100
    }),
    price: buildProperty(({ values }) => ({
      dataType: "number",
      name: "Price",
      validation: {
        requiredMessage: "You must set a price between 0 and 1000",
        min: 0,
        max: 1000
      },
      disabled: !values.available && {
        clearOnDisabled: true,
        disabledMessage: "You can only set the price on available items"
      },
      description: "Price with range validation"
    })),
    related_products: buildProperty({
      dataType: "array",
      name: "Related products",
      description: "Reference to self",
      of: {
        dataType: "reference",
        path: "products"
      }
    }),
    publisher: buildProperty({
      name: "Publisher",
      description: "This is an example of a map property",
      dataType: "map",
      properties: {
        name: {
          name: "Name",
          dataType: "string"
        },
        external_id: {
          name: "External id",
          dataType: "string"
        }
      }
    })
  },
  permissions: ({
                  user,
                  authController
                }) => ({
    edit: true,
    create: true,
    delete: false
  })
});
```

No FireCMS Cloud, essa coleção pode ser usada incluindo-a na prop `collections` do seu export principal, um objeto `FireCMSAppConfig`.

No FireCMS PRO, as `collections` são passadas diretamente para o hook `useBuildNavigationController`.

### Modificando uma coleção definida na UI

Se você só precisa adicionar algum código a uma coleção definida na UI, pode usar a função `modifyCollection` no seu objeto `FireCMSAppConfig`.

Isso se aplica **apenas ao FireCMS Cloud**.

```tsx
import { FireCMSAppConfig } from "@firecms/core";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... coleções definidas em código completo aqui
        ]);
    },
    modifyCollection: ({ collection }) => {
        if (collection.id === "products") {
            return {
                ...collection,
                name: "Products modified",
                entityActions: [
                    {
                        name: "Sample entity action",
                        onClick: ({ entity }) => {
                            console.log("Entity", entity);
                        }
                    }
                ]
            }
        }
        return collection;
    }
}

export default appConfig;
```

Você pode usar todas as props disponíveis na interface `Collection`.

## Subcoleções

Subcoleções são coleções de entidades encontradas sob outra entidade. Por exemplo, você pode ter uma coleção chamada "translations" sob a entidade "Article". Você só precisa usar o mesmo formato para definir sua coleção usando o campo `subcollections`.

Subcoleções são facilmente acessíveis na view lateral ao editar uma entidade.

## Filtros

:::tip
Se você precisar aplicar alguns filtros e ordenação por padrão, pode usar as props `initialFilter` e `initialSort`. Você também pode forçar uma combinação de filtros a sempre ser aplicada usando a prop `forceFilter`.
:::

A filtragem está habilitada por padrão para strings, números, booleanos, datas e arrays. Um dropdown está incluído em cada coluna da coleção onde aplicável.

Como o Firestore tem capacidades de consulta limitadas, cada vez que você aplica um filtro ou nova ordenação, a combinação anterior de ordenação/filtro é redefinida por padrão (a menos que você esteja filtrando ou ordenando pela mesma propriedade).

Se você precisar habilitar filtragem/ordenação por mais de uma propriedade ao mesmo tempo, pode especificar os filtros que habilitou na sua configuração do Firestore. Para isso, basta passar a configuração de índices para sua coleção:

```tsx
import { buildCollection } from "@firecms/core";

const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Product",
    properties: {
        // ...
    },
    indexes: [
        {
            price: "asc",
            available: "desc"
        }
    ]
});
```

## Configuração da coleção

O `name` e `properties` que você define para sua coleção de entidades serão usados para gerar os campos nas tabelas de coleção semelhantes a planilhas e os campos nos formulários gerados.

:::tip
Você pode forçar o CMS a sempre abrir o formulário ao editar um documento definindo a propriedade `inlineEditing` como `false` na configuração da coleção.
:::

- **`name`**: O nome plural da coleção. Ex.: 'Products'.
- **`singularName`**: O nome singular de uma entrada na coleção. Ex.: 'Product'.
- **`path`**: Caminho relativo do Firestore desta view ao seu pai. Se esta view estiver na raiz, o caminho é igual ao absoluto. Esse caminho também determina a URL no FireCMS.
- **`properties`**: Objeto definindo as propriedades para o schema da entidade. Mais informações em [Propriedades](../properties/properties_intro).
- **`propertiesOrder`**: Ordem em que as propriedades são exibidas.
    - Para propriedades, use a chave da propriedade.
    - Para campos adicionais, use a chave do campo.
    - Se você tiver subcoleções, terá uma coluna para cada subcoleção, com o caminho (ou alias) como a subcoleção, prefixado com `subcollection:`. Ex.: `subcollection:orders`.
    - Se estiver usando um grupo de coleções, terá também uma coluna adicional `collectionGroupParent`.
    - Note que se você definir esta prop, outras formas de ocultar campos, como `hidden` na definição da propriedade, serão ignoradas. `propertiesOrder` tem precedência sobre `hidden`.

  ```typescript
  propertiesOrder: ["name", "price", "subcollection:orders"]
  ```

- **`openEntityMode`**: Determina como a view da entidade é aberta. Você pode escolher entre `side_panel` (padrão) ou `full_screen`.
- **`formAutoSave`**: Se definido como true, o formulário será salvo automaticamente quando o usuário alterar o valor de um campo. Padrão false. Você não pode usar esta prop se estiver usando um `customId`.
- **`collectionGroup`**: Se esta coleção é uma entrada de navegação de nível superior, você pode definir esta propriedade como `true` para indicar que é um grupo de coleções.
- **`alias`**: Você pode definir um alias que será usado internamente em vez do `path`. O valor `alias` será usado para determinar a URL da coleção enquanto `path` ainda será usado no datasource. Note que você pode usar esse valor em propriedades de referência também.
- **`icon`**: Chave de ícone para usar nesta coleção. Você pode usar qualquer um dos ícones nas especificações Material: [Material Icons](https://fonts.google.com/icons). Ex.: 'account_tree' ou 'person'. Encontre todos os ícones em [Icons](https://firecms.co/docs/icons). Você também pode passar seu próprio componente de ícone (`React.ReactNode`).
- **`customId`**: Se esta prop não estiver definida, o ID do documento será criado pelo datasource. Você pode definir o valor como 'true' para forçar os usuários a escolherem o ID.
- **`subcollections`**: Seguindo o schema de documentos e coleções do Firestore, você pode adicionar subcoleções à sua entidade da mesma forma que define as coleções raiz.
- **`defaultSize`**: Tamanho padrão da coleção renderizada.
- **`group`**: Campo opcional usado para agrupar entradas de navegação de nível superior em uma view de navegação. Se você definir esse valor em uma subcoleção, não terá efeito.
- **`description`**: Descrição opcional desta view. Você pode usar Markdown.
- **`entityActions`**: Você pode definir ações adicionais que podem ser executadas nas entidades desta coleção. Essas ações podem ser exibidas na view de coleção ou na view de entidade. Você pode usar o método `onClick` para implementar sua própria lógica. Na prop `context`, você pode acessar todos os controllers do FireCMS. Você também pode definir ações de entidade globalmente. Veja [Ações de Entidade](./entity_actions) para mais detalhes.

```tsx
const archiveEntityAction: EntityAction = {
    icon: <ArchiveIcon/>,
    name: "Archive",
    onClick({
                entity,
                collection,
                context
            }): Promise<void> {
        // Adicione seu código aqui
        return Promise.resolve(undefined);
    }
}
```

- **`initialFilter`**: Filtros iniciais aplicados a esta coleção. Padrão nenhum. Os filtros aplicados com esta prop podem ser alterados pelo usuário.

- **`forceFilter`**: Força um filtro nesta view. Se aplicado, o restante dos filtros será desabilitado. Os filtros aplicados com esta prop não podem ser alterados.

- **`initialSort`**: Ordenação padrão aplicada a esta coleção. Aceita tuplas no formato `["property_name", "asc"]` ou `["property_name", "desc"]`.

- **`Actions`**: Builder para renderizar componentes adicionais como botões na toolbar da coleção.
- **`pagination`**: Se habilitado, o conteúdo é carregado em lotes. Se `false`, todas as entidades na coleção são carregadas. Você pode especificar um número para definir o tamanho da paginação (50 por padrão). Padrão `true`.
- **`additionalFields`**: Você pode adicionar campos adicionais tanto na view de coleção quanto na view de formulário implementando um delegado de campo adicional.
- **`textSearchEnabled`**: Flag para indicar se uma barra de pesquisa deve ser exibida no topo da tabela de coleção.
- **`permissions`**: Você pode especificar um objeto com permissões booleanas no formato `{edit:boolean; create:boolean; delete:boolean}` para indicar as ações que o usuário pode realizar. Você também pode passar um [`PermissionsBuilder`](../api/type-aliases/PermissionsBuilder) para personalizar as permissões com base no usuário ou entidade.
- **`inlineEditing`**: Os elementos desta coleção podem ser editados inline na view de coleção? Se esta flag for definida como false mas `permissions.edit` for `true`, as entidades ainda podem ser editadas no painel lateral.
- **`selectionEnabled`**: As entidades desta coleção são selecionáveis? Padrão `true`.
- **`exportable`**: Os dados desta view de coleção devem incluir um botão de exportação? Padrão `true`.
- **`hideFromNavigation`**: Esta coleção deve ser ocultada do painel de navegação principal se estiver no nível raiz, ou no painel lateral da entidade se for uma subcoleção?
- **`callbacks`**: Esta interface define todos os callbacks que podem ser usados quando uma entidade está sendo criada, atualizada ou deletada.
- **`entityViews`**: Array de builders para renderizar painéis adicionais em uma view de entidade.
- **`alwaysApplyDefaultValues`**: Se definido como true, os valores padrão das propriedades serão aplicados à entidade toda vez que ela for atualizada (não apenas quando criada).
- **`databaseId`**: ID de banco de dados opcional desta coleção.
- **`previewProperties`**: Propriedades de prévia padrão exibidas quando esta coleção é referenciada.
- **`titleProperty`**: Propriedade título da entidade.
- **`defaultSelectedView`**: Se você quiser abrir views personalizadas ou subcoleções por padrão ao abrir uma entidade, especifique o caminho aqui.
- **`hideIdFromForm`**: O ID desta coleção deve ser ocultado da view de formulário.
- **`hideIdFromCollection`**: O ID desta coleção deve ser ocultado da view de grade.
- **`sideDialogWidth`**: Largura do diálogo lateral (em pixels ou string) ao abrir uma entidade nesta coleção.
- **`editable`**: A configuração desta coleção pode ser editada pelo usuário final. Padrão `true`.
- **`includeJsonView`**: Se definido como true, uma aba com a representação JSON da entidade será incluída.
- **`history`**: Se definido como true, as alterações à entidade serão salvas em uma subcoleção.
- **`localChangesBackup`**: As alterações locais devem ser salvas no local storage para evitar perda de dados. Opções: `"manual_apply"` (pede para restaurar), `"auto_apply"` (restaura automaticamente), ou `false`. Padrão `"manual_apply"`.
- **`defaultViewMode`**: Modo de view padrão para exibir esta coleção. Opções: `"table"` (semelhante a planilha, padrão), `"cards"` (grade de cards com miniaturas), `"kanban"` (quadro agrupado por propriedade).
- **`kanban`**: Configuração para o modo de view Kanban. Requer um `columnProperty` referenciando uma propriedade enum.

```tsx
kanban: {
    columnProperty: "status" // Deve referenciar uma propriedade de string com enumValues
}
```

- **`orderProperty`**: Chave de propriedade para usar na ordenação dos itens. Deve referenciar uma propriedade numérica. Usado pela view Kanban para ordenação dentro das colunas.
