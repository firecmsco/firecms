---
title: Vistas de entidad (Entity views)
slug: es/docs/collections/entity_views
sidebar_label: Vistas de entidad
description: FireCMS te permite añadir vistas personalizadas por entidad. Ya sea que estés creando vistas previas, visualizaciones de páginas web, paneles de control, modificaciones de formularios o cualquier vista distintiva, las 'EntityCustomView' de FireCMS se adaptan a tus requerimientos únicos. Simplemente define tu componente React personalizado e intégralo dentro del esquema de tu colección de entidades como un 'EntityCustomView'. Para aplicaciones más amplias, registra la vista en el registro de vistas de entidades a través de `FireCMSAppConfig` para hacerla accesible a lo largo de diferentes colecciones. Estas vistas personalizadas de entidades son elementos fundamentales, que ofrecen una capa de personalización granular y mejoran la extensibilidad de tu CMS para diversas implementaciones.
---

![Custom entity view](/img/entity_view.png)

FireCMS ofrece campos de formulario y tabla predeterminados para casos de uso comunes y también permite
sobrescribir campos si necesitas una implementación personalizada, pero eso podría no ser
suficiente en ciertos casos, donde es posible que desees tener una vista **personalizada completa relacionada
con una entidad**.

Los casos de uso típicos para esto son:

- **Vista previa** de una entidad en un formato específico.
- Comprobar cómo se ven los datos en una **página web**.
- Definición de un **tablero (dashboard)**.
- Modificación del estado del **formulario**.
- ... o cualquier otra vista personalizada que puedas necesitar.

Cuando tu vista de entidad esté definida, puedes agregarla directamente a la colección
o incluirla en el registro de vistas de entidades.

### Definición de una vista personalizada de entidad

Para lograr eso, puedes pasar una matriz de `EntityCustomView`
a tu esquema. Como en este ejemplo:

```tsx
import React from "react";
import { EntityCustomView, buildCollection } from "@firecms/core";

const sampleView: EntityCustomView = {
    key: "preview",
    name: "Vista previa de la entrada del blog",
    Builder: ({
                  collection,
                  entity,
                  modifiedValues,
                  formContext
              }) => (
        // Este es un componente personalizado que puede compilar como cualquier componente de React.
        <MyBlogPreviewComponent entity={entity}
                                modifiedValues={modifiedValues}/>
    )
};
```

### Construcción de un formulario secundario

![Custom entity view](/img/entity_view_secondary_form.png)

En tus vistas personalizadas, también puedes agregar campos que están mapeados directamente a la entidad.
Esto es útil si deseas agregar un formulario secundario a tu vista de entidad.

Puedes agregar cualquier campo usando el componente `PropertyFieldBinding`. Este componente
vinculará el valor a la entidad y se guardará cuando se guarde la entidad.

En este ejemplo, estamos creando un formulario secundario con un campo de mapa, que incluye nombre y edad:

```tsx
import { EntityCustomViewParams, PropertyFieldBinding } from "@firecms/core";
import { Container } from "@firecms/ui";

export function SecondaryForm({
                                  formContext
                              }: EntityCustomViewParams) {

    return (
        <Container className={"my-16"}>
            <PropertyFieldBinding context={formContext}
                                  propertyKey={"myTestMap"}
                                  property={{
                                      dataType: "map",
                                      name: "Mi mapa de prueba",
                                      properties: {
                                          name: {
                                              name: "Nombre",
                                              dataType: "string",
                                              validation: { required: true }
                                          },
                                          age: {
                                              name: "Edad",
                                              dataType: "number",
                                          }
                                      }
                                  }}/>
        </Container>
    );
}
```

Luego, simplemente agrega tu vista personalizada a la colección:

```tsx
export const testCollection = buildCollection<any>({
    id: "users",
    path: "users",
    name: "Usuarios",
    properties: {
        // ... las propiedades de tu blog aquí
    },
    entityViews: [{
        key: "user_details",
        name: "Detalles",
        includeActions: true, // este prop te permite incluir las acciones predeterminadas en la barra inferior
        Builder: SecondaryForm
    }]
});
```

Ten en cuenta que puedes usar la propiedad `includeActions` para incluir las acciones predeterminadas en la barra inferior de la vista,
para que el usuario no necesite volver a la vista del formulario principal para realizar acciones como guardar o eliminar la entidad.


### Agrega tu vista de entidad directamente a la colección

Si estás editando una colección en el código, puedes agregar tu vista personalizada
directamente a la colección:

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    entityViews: [
        {
            key: "preview",
            name: "Vista previa de la entrada del blog",
            Builder: ({
                          collection,
                          entity,
                          modifiedValues
                      }) => (
                // Este es un componente personalizado que puede compilar como cualquier componente de React.
                <MyBlogPreviewComponent entity={entity}
                                        modifiedValues={modifiedValues}/>
            )
        }
    ],
    properties: {
        // ... las propiedades de tu blog aquí
    }
});
```

### Agrega tu vista de entidad al registro de vistas de entidad

Es posible que tengas una vista de entidad que desees reutilizar en diferentes colecciones.

#### FireCMS Cloud

En FireCMS Cloud, puedes agregarla al registro de vista de entidad en tu
exportación principal `FireCMSAppConfig`:

```tsx
import { FireCMSAppConfig } from "@firecms/core";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... sus colecciones aquí
        ]);
    },
    entityViews: [{
        key: "test-view",
        name: "Prueba",
        Builder: ({
                      collection,
                      entity,
                      modifiedValues
                  }) => <div>Tu vista</div>
    }]
}

export default appConfig;
```

#### FireCMS PRO

En FireCMS PRO, puedes agregarla al registro de vistas de entidades en tu componente
principal `FireCMS`:

```tsx
//...
<FireCMS
    //...
    entityViews={[{
        key: "test-view",
        name: "Prueba",
        Builder: ({
                      collection,
                      entity,
                      modifiedValues
                  }) => <div>Tu vista</div>
    }]}
    //...
/>
```

#### Usar vista registrada

Esto hará que la vista de entidad esté disponible en la interfaz de usuario del editor de colecciones.
También es posible usar el accesorio `entityView` en la colección
con la clave de la vista de entidad que desea usar:

```tsx
import { buildCollection } from "@firecms/core";

const blogCollection = buildCollection({
    id: "blog",
    path: "blog",
    name: "Blog",
    entityViews: ["test-view"],
    properties: {
        // ... las propiedades de tu blog aquí
    }
});
```

