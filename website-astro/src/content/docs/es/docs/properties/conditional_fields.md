---
title: Campos condicionales a partir de propiedades
slug: es/docs/properties/conditional_fields
sidebar_label: Campos condicionales
description: En FireCMS, los campos condicionales permiten configuraciones dinámicas de propiedades dentro de los esquemas de tu colección, lo que ofrece interfaces receptivas que se adaptan a los valores de otras propiedades en tiempo real. La función `PropertyBuilder` te permite construir propiedades cuyos atributos, como los estados habilitado o deshabilitado, están determinados por los valores de otros campos en la entidad. Esto es particularmente útil cuando deseas crear formularios intuitivos que cambian según la entrada del usuario o el contexto de los datos, garantizando una experiencia de gestión de contenido fluida. Ya sea que estés trabajando con interruptores booleanos o tipos de propiedades condicionales, como en las fuentes de autenticación de usuarios, los campos condicionales de FireCMS son herramientas esenciales para crear plataformas CMS flexibles y centradas en el usuario.
---

Al definir las propiedades de una colección, puedes elegir utilizar un constructor (builder)
[`PropertyBuilder`](../api/type-aliases/PermissionsBuilder), en lugar de asignar la
configuración de la propiedad directamente. 

Esto es útil para cambiar configuraciones de propiedades como valores disponibles sobre la
marcha (on the fly), basándose en otros valores.

:::tip
Puedes usar constructores de propiedades en cualquier nivel de tu árbol de propiedades
(incluyendo hijos de mapas y arrays).

Puedes acceder a los valores completos de la entidad que se está editando en el constructor
con la propiedad prop `values`, pero también al valor de la propiedad que se está construyendo con
`propertyValue`.
:::

### Ejemplo 1

Ejemplo de campo que se habilita o deshabilita según otros valores:

```tsx
import {
    buildCollection,
    EntityCollection,
    EntityReference
} from "@firecms/core";

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

export const productCollection: EntityCollection = buildCollection<Partial<Product>>({
    name: "Producto",
    properties: {
        available: {
            dataType: "boolean",
            name: "Disponible"
        },
        price: ({ values }) => ({
            dataType: "number",
            name: "Precio",
            validation: {
                requiredMessage: "Debes establecer un precio entre 0 y 1000",
                min: 0,
                max: 1000
            },
            disabled: !values.available && {
                clearOnDisabled: true,
                disabledMessage: "Solo puedes establecer el precio en artículos disponibles"
            },
            description: "Precio con validación de rango"
        })
    }
});
```

### Ejemplo 2

Un tipo `User` (Usuario) que tiene un campo `source` (fuente) que puede ser del tipo `facebook`
o `apple`, y sus campos cambian en consecuencia

```tsx
import {
    buildCollection,
    EntityCollection,
    buildProperty,
    buildProperties
} from "@firecms/core";

type User = {
    source: {
        type: "facebook",
        facebookId: string
    } | {
        type: "apple",
        appleId: number
    }
}

export const userSchema: EntityCollection = buildCollection<User>({
    name: "Usuario",
    properties: {
        source: ({ values }) => {
            const properties = buildProperties<any>({
                type: {
                    dataType: "string",
                    enumValues: {
                        "facebook": "FacebookId",
                        "apple": "Apple"
                    }
                }
            });

            if (values.source) {
                if ((values.source as any).type === "facebook") {
                    properties["facebookId"] = buildProperty({
                        dataType: "string"
                    });
                } else if ((values.source as any).type === "apple") {
                    properties["appleId"] = buildProperty({
                        dataType: "number"
                    });
                }
            }

            return ({
                dataType: "map",
                name: "Fuente",
                properties: properties
            });
        }
    }
});
```
