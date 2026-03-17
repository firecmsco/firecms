---
title: Grupos de colecciones (Collections Groups)
sidebar_label: Grupos de colecciones
---

Ahora puedes usar grupos de colecciones de Firestore en FireCMS. Esto te permite
realizar consultas en varias colecciones con el mismo nombre. Por ejemplo, podrías
tener un grupo de colecciones llamado `products` que contenga todos los productos
de diferentes `stores` (tiendas).

En nuestro proyecto de demostración, tenemos un grupo de colecciones llamado `locales` que
contiene todas las configuraciones regionales (locales) para los diferentes `products` (productos).

Ve el proyecto de demostración [aquí](https://demo.firecms.co/c/locales).

FireCMS generará una columna adicional en la vista de colección para
con referencias a todas las colecciones principales (padre) que forman parte de la
configuración.

Para usar grupos de colecciones, debes especificar la propiedad `collectionGroup`
en la configuración de la colección (`Collection`).

```tsx
export const localeCollectionGroup = buildCollection({
    name: "Grupo de configuraciones regionales del producto",
    path: "locales",
    description: "Este es un grupo de colecciones relacionado con la subcolección de configuraciones regionales de los productos.",
    collectionGroup: true,
    properties: {
        name: {
            name: "Nombre",
            validation: { required: true },
            dataType: "string"
        },
        // ...
    },
});
```

:::note
Dependiendo de tus reglas de Firestore, es posible que debas agregar otra
regla para permitir consultas de grupos de colecciones. Por ejemplo:

```text
match /{path=**}/locales/{document=**} {
  allow read, write: if true;
}
```

Al hacer una consulta de grupo de colecciones, la ruta será algo así como
`/products/{productId}/locales/{localeId}`. Pero la consulta se dirigirá a todas
las colecciones llamadas `locales` en tu base de datos. Por eso quizás necesites
agregar una regla como la anterior.
:::
