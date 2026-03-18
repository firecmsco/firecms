---
title: "Eject delle Collezioni dall'UI al Codice"
slug: it/docs/cloud/eject_collections
sidebar_label: Eject Collezioni
description: "Converti le collezioni definite tramite UI in codice per il tuo CMS headless."
---

La **versione più recente di [FireCMS](https://app.firecms.co)**, versione 3.0, ti permette di gestire completamente il CMS nel Cloud senza dover gestire il codice, così puoi creare collezioni usando la nostra **UI per creare qualsiasi schema** di cui hai bisogno.

Considera la collezione Books della nostra [demo](https://demo.firecms.co). La collezione include campi come Titolo, Sottotitolo, Autori, Valutazione, Categoria, ecc. Puoi creare questa collezione usando l'UI e gestirla dall'UI.

![edit_collection_in_ui](/img/docs/collections/eject_collections_book_collection.png)

Ma cosa succede se hai bisogno di **personalizzare** ulteriormente la vista, o preferisci usare il codice per creare la collezione? FireCMS ti permette di farlo. Puoi iniziare un processo di personalizzazione con la nostra [guida quickstart](https://firecms.co/docs/cloud/quickstart) e poi caricarlo nel Cloud.

Una domanda comune che riceviamo è come importare il codice di una collezione. È semplice come navigare nell'Editor Schema, fare clic sul pulsante Codice e copiare il codice generato. Puoi poi **fare l'eject della collezione** e gestirla direttamente dal tuo codebase.

![edit_collection_code_button](/img/docs/collections/eject_collections_code_button.png)

Poi, incolla il codice copiato nel tuo editor di codice preferito.

![edit_collection_code_button](/img/docs/collections/eject_collections_code.png)

:::important
Questa funzionalità è disponibile in tutti i piani, incluse le sottoscrizioni gratuita e plus. Crediamo nel potere del codice e vogliamo renderlo accessibile a tutti.
:::

In sintesi, l'ultima versione di [FireCMS](https://app.firecms.co) fornisce un'**esperienza No Code senza interruzioni** per gestire il tuo CMS. Tuttavia, se hai bisogno di personalizzare ulteriormente il tuo CMS, puoi facilmente passare a un approccio basato sul codice.

Ecco il codice completo generato dall'UI per la collezione Books:

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
                { id: 'drama', label: 'Drama' },
                { label: 'Education', id: 'education' },
                { label: 'Fantasy', id: 'fantasy' },
                { id: 'fantasy-fiction', label: 'Fantasy Fiction' },
                { label: 'Fiction', id: 'fiction' },
                { id: 'history', label: 'History' },
                { id: 'juvenile-fiction', label: 'Juvenile Fiction' },
                { id: 'philosophy', label: 'Philosophy' },
                { id: 'religion', label: 'Religion' },
                { label: 'Science', id: 'science' },
                { id: 'self-help', label: 'Self Help' },
                { id: 'travel', label: 'Travel' },
            ],
        },
        created_at: { name: 'Created At', dataType: 'date' },
        description: { name: 'Description', dataType: 'string' },
        isbn10: { name: 'Isbn10', dataType: 'number' },
        isbn13: { name: 'Isbn13', dataType: 'number' },
        num_pages: { name: 'Num Pages', dataType: 'number' },
        published_year: { dataType: 'number', name: 'Published Year' },
        ratings_count: { name: 'Ratings Count', dataType: 'number' },
        spanish_description: { name: 'Spanish Description', dataType: 'string' },
        tags: {
            dataType: 'array',
            of: { dataType: 'string', editable: true, name: 'Tags' },
            name: 'Tags',
        },
        thumbnail: { dataType: 'string', url: true, name: 'Thumbnail' },
    },
    subcollections: [],
}
```
