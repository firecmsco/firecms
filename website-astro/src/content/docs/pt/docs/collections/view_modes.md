---
slug: pt/docs/collections/view_modes
title: Modos de View de Coleção
sidebar_label: Modos de View
description: Exiba suas coleções como Tabelas, Cards ou quadros Kanban no FireCMS. Escolha a view que combina com seus dados.
---

O FireCMS oferece três formas diferentes de visualizar suas coleções. Cada modo de view é otimizado para diferentes tipos de dados e fluxos de trabalho.

![Collection View Modes](/img/blog/kanban_settings.png)

## Modos de View Disponíveis

| Modo de View | Descrição | Melhor Para |
|--------------|-----------|-------------|
| **Tabela** | Grade semelhante a planilha com edição inline | Dados densos, operações em lote, registros detalhados |
| **Cards** | Grade responsiva exibindo miniaturas e campos-chave | Conteúdo visual, catálogos de produtos, bibliotecas de mídia |
| **Kanban** | Quadro com colunas baseado em um campo de status/categoria | Fluxos de trabalho, gestão de tarefas, pipelines de pedidos |

## Definindo a View Padrão

Use a propriedade `defaultViewMode` na configuração da sua coleção:

```typescript
const productsCollection = buildCollection({
    path: "products",
    name: "Products",
    defaultViewMode: "cards", // "table" | "cards" | "kanban"
    properties: {
        // ...
    }
});
```

Os usuários ainda podem alternar entre views usando o seletor de view na toolbar da coleção — o `defaultViewMode` apenas define o que eles veem primeiro.

---

## Restringindo Views Disponíveis

Por padrão, todos os três modos de view estão disponíveis. Use `enabledViews` para restringir quais views aparecem no seletor:

```typescript
const ordersCollection = buildCollection({
    path: "orders",
    name: "Orders",
    enabledViews: ["table", "kanban"], // A view de Cards não estará disponível
    properties: {
        // ...
    }
});
```

:::note
A view Kanban fica automaticamente disponível para qualquer coleção que tenha pelo menos uma propriedade de string com `enumValues` definidos. Se não existirem propriedades enum, o Kanban não aparecerá no seletor mesmo que incluído em `enabledViews`.
:::

---

## View de Tabela

O modo de view padrão. Exibe entidades em uma grade semelhante a planilha com suporte para:
- Edição inline
- Ordenação e filtragem
- Redimensionamento e reordenação de colunas
- Seleção em lote

**Melhor para:** Listas de usuários, logs de transação, dados analíticos, qualquer coleção onde você precisa ver muitos campos de uma vez.

---

## View de Cards

Transforma sua coleção em uma grade responsiva de cards. Cada card exibe:
- Miniaturas de imagens (detectadas automaticamente de propriedades de imagem)
- Título e metadados-chave
- Ações rápidas

![Cards View Example](/img/blog/cards_view_plants.png)

### Habilitar View de Cards

```typescript
const productsCollection = buildCollection({
    path: "products",
    name: "Products",
    defaultViewMode: "cards",
    properties: {
        name: buildProperty({ dataType: "string", name: "Name" }),
        image: buildProperty({ 
            dataType: "string", 
            storage: { mediaType: "image", storagePath: "products" } 
        }),
        price: buildProperty({ dataType: "number", name: "Price" })
    }
});
```

**Melhor para:** Catálogos de produtos, posts de blog, bibliotecas de mídia, diretórios de equipe, portfólios — qualquer coleção com imagens.

---

## View Kanban

Exibe entidades como cards organizados em colunas com base em uma propriedade enum. Arraste e solte cards entre colunas para atualizar seu status.

![Kanban View in Action](/img/blog/kanban_view.png)

### Detecção Automática

A view Kanban é **automaticamente disponível** para qualquer coleção que tenha pelo menos uma propriedade de string com `enumValues` definidos. Nenhuma configuração adicional é necessária — basta definir sua propriedade enum e a opção Quadro aparecerá no seletor de view.

### Definindo uma Propriedade de Coluna Padrão

Quando sua coleção tem múltiplas propriedades enum, você pode definir qual é usada para colunas por padrão com a configuração `kanban`. Os usuários podem alternar entre propriedades enum no seletor de view.

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: {
        columnProperty: "status" // Opcional: pré-seleciona qual enum agrupar
    },
    properties: {
        title: buildProperty({ dataType: "string", name: "Task" }),
        status: buildProperty({
            dataType: "string",
            name: "Status",
            enumValues: {
                todo: "To Do",
                in_progress: "In Progress",
                review: "Review",
                done: "Done"
            }
        })
    }
});
```

### Reordenação por Arrastar e Soltar

Para habilitar a reordenação de cards dentro de uma coluna, adicione um `orderProperty`:

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tasks",
    defaultViewMode: "kanban",
    kanban: { columnProperty: "status" },
    orderProperty: "order", // Deve referenciar uma propriedade numérica
    properties: {
        title: buildProperty({ dataType: "string", name: "Task" }),
        status: buildProperty({
            dataType: "string",
            name: "Status",
            enumValues: { todo: "To Do", in_progress: "In Progress", done: "Done" }
        }),
        order: buildProperty({ dataType: "number", name: "Order" })
    }
});
```

O `orderProperty` usa indexação fracionária para manter a ordem sem reescrever todos os documentos a cada reordenação.

:::caution[Índice do Firestore Necessário]
Ao usar a view Kanban com o Firestore, você precisará de um índice composto na sua propriedade de coluna. O Firestore solicitará o link do índice exato quando você carregar a view pela primeira vez.
:::

**Melhor para:** Gestão de tarefas, fulfillment de pedidos, pipelines de conteúdo, tickets de suporte, fluxos de trabalho de contratação — qualquer coleção com estágios distintos.

---

## Configuração no FireCMS Cloud

Se você estiver usando o FireCMS Cloud, pode configurar modos de view pela UI sem escrever código:

1. Abra as configurações da sua coleção
2. Vá para a guia **Display**
3. Selecione sua **View de coleção padrão** (Tabela, Cards ou Kanban)
4. Para Kanban, escolha a **Propriedade de Coluna Kanban** e opcionalmente uma **Propriedade de Ordem**

![Kanban Settings in FireCMS Cloud](/img/blog/kanban_settings.png)
