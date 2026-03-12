---
slug: pt/docs/cloud/eject_collections
title: "Ejetar Coleções da UI para o Código"
sidebar_label: Ejetar Coleções
description: "Converta coleções definidas na UI para código para o seu headless CMS. Exporte sua configuração de schema do Firestore para controle de versão e personalização avançada."
---

A **versão mais recente do [FireCMS](https://app.firecms.co)**, versão 3.0, permite gerenciar completamente o CMS na Cloud
sem precisar gerenciar código, para que você possa criar coleções usando nossa **UI para criar qualquer schema** que precisar.

Considere a coleção Books do nosso [demo](https://demo.firecms.co). A coleção inclui campos como Título,
Subtítulo, Autores, Avaliação, Categoria, etc. Você pode criar esta coleção usando a UI e gerenciá-la a partir da UI.
Qualquer texto, datas, imagens, lista de texto ou outros campos que você possa imaginar.

![edit_collection_in_ui](/img/docs/collections/eject_collections_book_collection.png)

Mas e se você precisar **personalizar** a view **ainda mais**, ou preferir usar código para criar a coleção? O FireCMS
permite exatamente isso. Você pode iniciar um processo de personalização com
nosso [guia de início rápido](https://firecms.co/docs/cloud/quickstart) e depois fazer upload para a Cloud, usando o mesmo
app hospedado.

Uma pergunta comum que recebemos é como importar o código de uma coleção. É simples como navegar até o
Editor de Schema, clicar no botão Código e copiar o código gerado. Você pode então **ejetar a coleção** e gerenciá-la
diretamente do seu codebase.

![edit_collection_code_button](/img/docs/collections/eject_collections_code_button.png)

Em seguida, cole o código copiado no seu Editor de Código preferido.

![edit_collection_code_button](/img/docs/collections/eject_collections_code.png)

:::important
Este recurso está disponível em todos os planos, incluindo assinaturas free e plus. Acreditamos no poder do código e
queremos torná-lo acessível a todos.
:::

Resumindo, a versão mais recente do [FireCMS](https://app.firecms.co) fornece uma **experiência No Code perfeita** para
gerenciar seu CMS. No entanto, se precisar personalizar seu CMS ainda mais, pode facilmente mudar para uma abordagem baseada em Código.
Tudo dentro de um único app, [app.firecms.co](https://app.firecms.co).

Aqui está o código completo gerado pela UI para a coleção Books:

```tsx
import { EntityCollection } from "@firecms/core";

const BooksCollection: EntityCollection = {
    id: 'books',
    name: 'Books',
    path: 'books',
    editable: true,
    icon: 'table_rows',
    group: '',
    properties: {
        title: {
            name: 'Title',
            validation: {
                required: true,
            },
            dataType: 'string',
        },
        subtitle: {
            dataType: 'string',
            name: 'Subtitle',
        },
        authors: {
            name: 'Authors',
            dataType: 'string',
        },
        average_rating: {
            dataType: 'number',
            name: 'Average Rating',
        },
        category: {
            name: 'Category',
            dataType: 'string',
            enumValues: [
                {
                    id: 'drama',
                    label: 'Drama',
                },
                {
                    label: 'Education',
                    id: 'education',
                },
                {
                    label: 'Fantasy',
                    id: 'fantasy',
                },
                {
                    id: 'fantasy-fiction',
                    label: 'Fantasy Fiction',
                },
                {
                    label: 'Fiction',
                    id: 'fiction',
                },
                {
                    id: 'history',
                    label: 'History',
                },
                {
                    id: 'juvenile-fiction',
                    label: 'Juvenile Fiction',
                },
                {
                    id: 'philosophy',
                    label: 'Philosophy',
                },
                {
                    id: 'religion',
                    label: 'Religion',
                },
                {
                    label: 'Science',
                    id: 'science',
                },
                {
                    id: 'self-help',
                    label: 'Self Help',
                },
                {
                    id: 'travel',
                    label: 'Travel',
                },
            ],
        },
        created_at: {
            name: 'Created At',
            dataType: 'date',
        },
        description: {
            name: 'Description',
            dataType: 'string',
        },
        isbn10: {
            name: 'Isbn10',
            dataType: 'number',
        },
        isbn13: {
            name: 'Isbn13',
            dataType: 'number',
        },
        num_pages: {
            name: 'Num Pages',
            dataType: 'number',
        },
        published_year: {
            dataType: 'number',
            name: 'Published Year',
        },
        ratings_count: {
            name: 'Ratings Count',
            dataType: 'number',
        },
        spanish_description: {
            name: 'Spanish Description',
            dataType: 'string',
        },
        tags: {
            dataType: 'array',
            of: {
                dataType: 'string',
                editable: true,
                name: 'Tags',
            },
            name: 'Tags',
        },
        thumbnail: {
            dataType: 'string',
            url: true,
            name: 'Thumbnail',
        },
    },
    subcollections: [],
}
```
