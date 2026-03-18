---
title: "Expulsar colecciones de la UI al código"
slug: es/docs/cloud/eject_collections
sidebar_label: Expulsar colecciones
description: "Convierte las colecciones definidas en la UI en código para tu CMS headless. Exporta la configuración del esquema de tu Firestore para el control de versiones y una personalización avanzada."
---

La **versión más reciente de [FireCMS](https://app.firecms.co)**, la versión 3.0, te permite gestionar completamente el CMS en la nube
sin tener que gestionar código, para que puedas crear colecciones utilizando nuestra **UI para crear cualquier esquema** que necesites.

Considera la colección de Libros (Books) de nuestra [demo](https://demo.firecms.co). La colección incluye campos como Título,
Subtítulo, Autores, Calificación, Categoría, etc. Puedes crear esta colección utilizando la UI, y luego gestionarla desde la UI.
Cualquier texto, fechas, imágenes, listas de texto u otros campos que se te ocurran.

![editar_coleccion_en_ui](/img/docs/collections/eject_collections_book_collection.png)

Pero, ¿qué sucede si necesitas **personalizar** la vista **aún más**, o prefieres utilizar código para crear la colección? FireCMS
te permite hacer exactamente eso. Puedes comenzar un proceso de personalización con
nuestra [guía de inicio rápido](https://firecms.co/docs/cloud/quickstart) y luego subirla a la nube, utilizando la misma
aplicación alojada.

Una pregunta común que recibimos es cómo importar el código de una colección. Es tan simple como navegar al Editor de Esquemas (Schema Editor),
hacer clic en el botón Código (Code) y copiar el código generado. Luego puedes **expulsar la colección** y gestionarla
directamente desde tu código base.

![boton_codigo_editar_coleccion](/img/docs/collections/eject_collections_code_button.png)

A continuación, pega el código copiado en tu editor de código preferido.

![codigo_editar_coleccion](/img/docs/collections/eject_collections_code.png)

:::important
Esta función está disponible en todos los planes, incluidas las suscripciones **gratuitas** y plus. Creemos en el poder del código y
queremos hacerlo accesible a todos.
:::

En resumen, la última versión de [FireCMS](https://app.firecms.co) proporciona una **experiencia sin código (No Code) perfecta** para
gestionar tu CMS. Sin embargo, si necesitas personalizar tu CMS aún más, puedes cambiar fácilmente a un enfoque basado en código.
Todo dentro de una sola aplicación, [app.firecms.co](https://www.notion.so/e8af421701bb440ebcc4ef4ce265e9ad?pvs=21).

Aquí tienes el código completo generado por la UI para la colección de Libros:

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
