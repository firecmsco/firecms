---
title: "Éjecter les collections de l'interface vers le code"
slug: fr/docs/cloud/eject_collections
sidebar_label: Éjecter les collections
description: "Convertissez les collections définies dans l'interface en code pour votre CMS headless. Exportez la configuration de votre schéma Firestore pour le contrôle de version et la personnalisation avancée."
---

La **dernière version de [FireCMS](https://app.firecms.co)**, version 3.0 vous permet de gérer entièrement le CMS dans le Cloud
sans avoir à gérer du code, vous pouvez donc créer des collections en utilisant notre **interface pour créer n'importe quel schéma** dont vous avez besoin.

Considérez la collection Livres de notre [démo](https://demo.firecms.co). La collection comprend des champs tels que Titre,
Sous-titre, Auteurs, Note, Catégorie, etc. Vous pouvez créer cette collection en utilisant l'interface, puis la gérer depuis l'interface.
Tout texte, date, image, liste de texte ou autre champ que vous pouvez imaginer.

![edit_collection_in_ui](/img/docs/collections/eject_collections_book_collection.png)

Mais que faire si vous avez besoin de **personnaliser** la vue **davantage**, ou si vous préférez utiliser du code pour créer la collection ? FireCMS
vous le permet. Vous pouvez commencer un processus de personnalisation avec
notre [guide de démarrage rapide](https://firecms.co/docs/cloud/quickstart) puis le téléverser vers le Cloud, en utilisant la même
application hébergée.

Une question fréquente que nous recevons est comment importer le code d'une collection. C'est aussi simple que de naviguer vers l'éditeur de schéma,
de cliquer sur le bouton Code et de copier le code généré. Vous pouvez ensuite **éjecter la collection** et la gérer
directement depuis votre base de code.

![edit_collection_code_button](/img/docs/collections/eject_collections_code_button.png)

Ensuite, collez le code copié dans votre éditeur de code préféré.

![edit_collection_code_button](/img/docs/collections/eject_collections_code.png)

:::important
Cette fonctionnalité est disponible sur tous les plans, y compris les abonnements gratuits et plus. Nous croyons au pouvoir du code et
voulons le rendre accessible à tous.
:::

En résumé, la dernière version de [FireCMS](https://app.firecms.co) offre une **expérience No Code fluide** pour
la gestion de votre CMS. Cependant, si vous avez besoin de personnaliser davantage votre CMS, vous pouvez facilement passer à une approche basée sur le code.
Tout au sein d'une seule application, [app.firecms.co](https://app.firecms.co).

Voici le code complet généré par l'interface pour la collection Livres :

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
