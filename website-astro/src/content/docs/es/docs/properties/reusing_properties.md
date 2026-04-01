---
title: Reutilización de configuraciones de propiedades
slug: es/docs/properties/reusing_properties
---

:::tip
Cuando defines la configuración de una propiedad, podrás seleccionarla en
el editor de la colección.
:::

FireCMS 3 introdujo una nueva forma de definir propiedades que te permite
reutilizarlas en diferentes entidades y colecciones.

Puedes definir un objeto `propertyConfigs` que
contiene todas las configuraciones relacionadas con una propiedad. Básicamente, se trata de una matriz (array) de
objetos `PropertyConfig`, que se definen de la siguiente manera:

```typescript
export type PropertyConfig<T extends CMSType = any> = {

    /**
     * Clave (Key) usada para identificar la configuración de esta propiedad.
     */
    key: string,

    /**
     * Nombre de este tipo de campo.
     * Este no es el nombre de la propiedad.
     */
    name: string;

    /**
     * Configuración predeterminada para la propiedad.
     * Esta propiedad o generador (builder) se utilizará como valores base para la propiedad resultante.
     * También puedes usar una función de generador para crear la propiedad base.
     * Puedes usar una función de generador para crear la propiedad en función de los valores o la ruta (path).
     * También puedes definir un Campo (Field) personalizado como un componente React para ser usado en esta propiedad.
     */
    property: PropertyOrBuilder<T>;

    /**
     * Ícono opcional para usar en el selector de campos.
     * Utiliza un componente de 24x24, para no romper el diseño (layout).
     * Se puede usar cualquier ícono de FireCMS.
     */
    Icon?: React.ComponentType;

    /**
     * Color CSS, usado solo en algunos complementos (plugins) como el selector de campos.
     * por ejemplo "#2d7ff9"
     */
    color?: string;

    /**
     * Descripción de este tipo de campo.
     */
    description?: string;

}
```

Ten en cuenta que puedes usar cualquiera de los generadores (builders) o propiedades existentes como base para
tu propiedad personalizada. Lo que definas en tu propiedad se usará como base
para la propiedad resultante (el usuario aún puede personalizarla).

### FireCMS Cloud

Definamos una propiedad personalizada que consiste en un objeto de mapa (map) de traducciones con diferentes valores de cadena (string):

```typescript

export const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: [
        // ...
    ],
    propertyConfigs: [
        {
            name: "Texto traducido",
            key: "translated_string",
            property: {
                dataType: "map",
                properties: {
                    en: {
                        dataType: "string",
                        name: "English"
                    },
                    es: {
                        dataType: "string",
                        name: "Español"
                    },
                },
            },
        }
    ]
};
```

### FireCMS PRO

En FireCMS PRO, puedes definir los `propertyConfigs` en el componente `FireCMS`:

```tsx
<FireCMS
    //...
    propertyConfigs={[
        {
            name: "Texto traducido",
            key: "translated_string",
            property: {
                dataType: "map",
                properties: {
                    en: {
                        dataType: "string",
                        name: "English"
                    },
                    es: {
                        dataType: "string",
                        name: "Español"
                    },
                },
            },
        }
    ]}
/>
```
