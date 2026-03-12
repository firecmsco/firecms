---
slug: es/docs/collections/dynamic_collections
title: Colecciones dinámicas (Dynamic collections)
sidebar_label: Colecciones dinámicas
description: Desbloquea la gestión de contenido personalizado con colecciones dinámicas en FireCMS, donde las colecciones pueden adaptarse al perfil del usuario conectado utilizando devoluciones de llamada asíncronas. Adapta tu CMS con propiedades personalizadas creadas sobre la marcha, asegurando un entorno altamente reactivo y seguro que se alinea con los roles y permisos del usuario. Mediante la utilización estratégica de `EntityCollectionsBuilder` y `AuthController`, genera dinámicamente esquemas de datos adecuados para cada usuario, mejorando su experiencia en el CMS con interfaces inteligentes y específicas para cada rol.
---

FireCMS ofrece la posibilidad de definir colecciones dinámicamente. Esto significa
que las colecciones se pueden crear de forma asíncrona, según el usuario que haya iniciado sesión,
según los datos de otras colecciones o según cualquier otra condición
arbitraria.

En lugar de definir tus colecciones como un arreglo (array), usa un `EntityCollectionsBuilder`,
una función que devuelve una promesa (promise) de un objeto que contiene las colecciones.

```tsx
import { EntityCollectionsBuilder } from "@firecms/core";

// ...

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) =>
    ({
        collections: [
            buildCollection({
                path: "products",
                properties: {}, // ...
                name: "Productos"
            })
        ]
    });
```

:::note
Si desea realizar personalizaciones solo a nivel de propiedad, consulte la sección
[campos condicionales](../properties/conditional_fields). Pero tenga en cuenta que los campos condicionales no
son adecuados para operaciones asíncronas.
:::

### Obtener datos de una colección diferente

Puede darse el caso de que la configuración de una colección dependa de los datos de otra.
Por ejemplo, es posible que desee obtener los valores de enumeración de una propiedad de una
colección diferente.

En este ejemplo, obtendremos datos de una colección llamada `categories` y
los usaremos para completar los valores de enumeración de una propiedad llamada `category`, en la colección `products`.

```tsx
import { useCallback } from "react";
import { buildCollection, EntityCollectionsBuilder } from "@firecms/core";

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {

    // supongamos que tiene una colección de base de datos llamada "categories"
    const categoriesData: Entity<any>[] = await dataSource.fetchCollection({
        path: "categories"
    });

    return {
        collections: [
            buildCollection({
                id: "products",
                path: "products",
                properties: {
                    // ...
                    category: {
                        dataType: "string",
                        name: "Categoría",
                        // podemos usar la propiedad enumValues para definir los valores de enumeración
                        // el valor almacenado será el id de la categoría
                        // y la etiqueta de la interfaz de usuario será el nombre de la categoría
                        enumValues: categoriesData.map((category: any) => ({
                            id: category.id,
                            label: category.values.name
                        }))
                    }
                    // ...
                },
                name: "Productos"
            })
        ]
    }
};

```

### Usar junto con la autenticación

El `AuthController` maneja el estado de autenticación. También se puede utilizar para almacenar cualquier
objeto arbitrario relacionado con el usuario.

Un caso de uso típico es almacenar algunos datos adicionales relacionados con el usuario, por
ejemplo, los roles o los permisos.

```tsx
import { useCallback } from "react";

const myAuthenticator: Authenticator<FirebaseUserWrapper> = useCallback(async ({
                                                                            user,
                                                                            authController
                                                                        }) => {

    if (user?.email?.includes("flanders")) {
        throw Error("¡Estúpido Flanders!");
    }

    console.log("Permitiendo el acceso a", user?.email);
    // Este es un ejemplo de cómo recuperar datos asíncronos relacionados con el usuario
    // y almacenarlo en el campo extra del controlador.
    const sampleUserRoles = await Promise.resolve(["admin"]);
    authController.setExtra(sampleUserRoles);

    return true;
}, []);
```

Luego puede acceder a los datos adicionales en la devolución de llamada `collectionsBuilder`.

```tsx
const collectionsBuilder: EntityCollectionsBuilder = useCallback(async ({
                                                                            user,
                                                                            authController,
                                                                            dataSource
                                                                        }) => {

    const userRoles = authController.extra;

    if (userRoles?.includes("admin")) {
        return {
            collections: [
                buildCollection({
                    path: "products",
                    properties: {}, // ...
                    name: "Productos"
                })
            ]
        };
    } else {
        return {
            collections: []
        };
    }
}, []);
```

### Dónde usar `collectionsBuilder`

En la **versión Cloud** de FireCMS, simplemente agregue el `collectionsBuilder` al prop `collections` de la configuración
de su aplicación principal.

```tsx

const collectionsBuilder: EntityCollectionsBuilder = async ({
                                                                user,
                                                                authController,
                                                                dataSource
                                                            }) => {
    return {
        collections: [] // sus colecciones aquí
    };
};

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: collectionsBuilder
};
```

En la **versión PRO** de FireCMS, puede usar `collectionsBuilder` en el hook `useBuildNavigationController`.

```tsx
const navigationController = useBuildNavigationController({
    collections: collectionsBuilder
});
```
