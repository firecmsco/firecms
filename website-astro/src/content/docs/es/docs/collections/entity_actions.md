---
slug: es/docs/collections/entity_actions
title: Acciones de entidad (Entity actions)
sidebar_label: Acciones de entidad
---

Las entidades se pueden editar, eliminar y duplicar de forma predeterminada.

Las acciones predeterminadas se habilitan o deshabilitan en función de los permisos
del usuario en la colección.

Si necesitas agregar acciones personalizadas, puedes hacerlo definiéndolas en el
prop `entityActions` de la colección.

También puedes definir acciones de entidad de forma global y estarán disponibles en todas las colecciones.
Esto es útil para acciones que no son específicas de una sola colección, como una acción "Compartir".
Al definir una acción de entidad global, debes proporcionar una propiedad `key` única.

Las acciones se mostrarán en el menú de la vista de colección de forma predeterminada
y en la vista de formulario si `includeInForm` se establece en verdadero (true).

Puedes acceder a todos los controladores de FireCMS en el `context`. Eso es útil para acceder a la fuente de datos,
modificar datos, acceder al almacenamiento, abrir cuadros de diálogo, etc.

En el prop `icon`, puede pasar un elemento React para mostrar un ícono junto al nombre de la acción.
Recomendamos usar cualquiera de los [íconos de FireCMS](/docs/icons), que están disponibles en el paquete `@firecms/ui`.

### Definiendo acciones a nivel de colección

```tsx
import { buildCollection } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Productos",
    singularName: "Producto",
    icon: "shopping_cart",
    description: "Lista de los productos que se venden actualmente en nuestra tienda",
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archivar",
            onClick({
                        entity,
                        collection,
                        context,
                    }): Promise<void> {

                // nota que puedes acceder a todos los controladores en el contexto
                const dataSource = context.dataSource;

                // Añade tu código aquí
                return Promise.resolve(undefined);
            }
        }
    ],
    properties: {}
});
````

### Definiendo acciones globalmente

Puedes definir acciones de entidad globalmente pasándolas al componente `FireCMS` si eres autoalojado,
o en `FireCMSAppConfig` si estás usando FireCMS Cloud.

```tsx
import { ShareIcon } from "@firecms/ui";

// Auto-alojado (Self-hosted)
<FireCMS
    entityActions={[{
        key: "share",
        name: "Compartir",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Tu lógica de compartir aquí
        }
    }]}
    {...otherProps}
/>
```

```tsx
import { ShareIcon } from "@firecms/ui";

// FireCMS Cloud
const appConfig: FireCMSAppConfig = {
    entityActions: [{
        key: "share",
        name: "Compartir",
        icon: <ShareIcon/>,
        onClick: ({ entity, context }) => {
            // Tu lógica de compartir aquí
        }
    }],
    // ...other config
};
```

#### EntityAction

* `name`: Nombre de la acción
* `key`?: Clave de la acción. Solo necesitas proporcionar esto si deseas
  sobrescribir las acciones predeterminadas, o si estás definiendo la acción globalmente.
  Las acciones por defecto son:
  * `edit`
  * `delete`
  * `copy`
* `icon`?: Icono de React.ReactElement de la acción
* `onClick`: (props: EntityActionClickProps) =\> Promise
  Función a ser llamada cuando se hace clic en la acción
* `collapsed`?: boolean Muestra esta acción contraída en el menú de la vista de colección. El valor predeterminado es true. Si es false, la
  acción se mostrará en el menú
* `includeInForm`?: boolean Muestra esta acción en el formulario; el valor predeterminado es `true`
* `disabled`?: boolean Desactiva esta acción; su valor predeterminado es `false`

#### EntityActionClickProps

* `entity`: Entidad que se está editando
* `context`: FireCMSContext, utilizado para acceder a todos los controladores
* `fullPath`?: string
* `fullIdPath`?: string
* `collection`?: EntityCollection
* `formContext`?: FormContext, presente si la acción se está llamando desde un formulario.
* `selectionController`?: SelectionController, utilizado para acceder a las entidades seleccionadas o modificar la selección
* `highlightEntity`?: (entity: Entity) => void
* `unhighlightEntity`?: (entity: Entity) => void
* `onCollectionChange`?: () => void
* `sideEntityController`?: SideEntityController
* `view`: "collection" | "form"
* `openEntityMode`: "side_panel" | "full_screen"
* `navigateBack`?: () => void

## Ejemplos

Construyamos un ejemplo donde agregamos una acción para archivar un producto.
Cuando se haga clic en la acción, llamaremos a una Google Cloud Function que ejecutará cierta lógica comercial en el backend.

###  Usando la API `fetch`

Puedes utilizar la API `fetch` estándar para llamar a cualquier endpoint HTTP, incluida una Google Cloud Function. Este es un método de propósito general que funciona con cualquier backend.

```tsx
import { buildCollection, Product } from "@firecms/core";
import { ArchiveIcon } from "@firecms/ui";

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // otras propiedades
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archivar",
            collapsed: false,
            onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                return fetch("[TU_ENDPOINT]/archiveProduct", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        productId: entity.id
                    })
                }).then(() => {
                    snackbarController.open({
                        message: "Producto archivado",
                        type: "success"
                    });
                }).catch((error) => {
                    snackbarController.open({
                        message: "Error archivando producto",
                        type: "error"
                    });
                });
            }
        }
    ],
});
```

### Usando el SDK de Firebase Functions

Si usas Firebase, el enfoque recomendado es usar el Firebase Functions SDK. Simplifica el llamado a (calling) funciones y maneja automáticamente los tokens de autenticación.

Primero, asegúrate de tener el paquete `firebase` instalado e inicializado en tu proyecto.

Luego, puedes definir tu acción así:

```tsx
import { getFunctions, httpsCallable } from "firebase/functions";
import { ArchiveIcon } from "@firecms/ui";
import { buildCollection, Product } from "@firecms/core";

// Inicializa Firebase Functions
// Asegúrate de haber inicializado Firebase en otro lugar de tu aplicación
const functions = getFunctions();
const archiveProductCallable = httpsCallable(functions, 'archiveProduct');

export const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    // otras propiedades
    entityActions: [
        {
            icon: <ArchiveIcon/>,
            name: "Archivar con Firebase",
            collapsed: false,
            async onClick({
                        entity,
                        context,
                    }) {
                const snackbarController = context.snackbarController;
                try {
                    await archiveProductCallable({ productId: entity.id });
                    snackbarController.open({
                        message: "Producto archivado correctamente",
                        type: "success"
                    });
                } catch (error) {
                    console.error("Error archivando el producto:", error);
                    snackbarController.open({
                        message: "Error archivando el producto: " + error.message,
                        type: "error"
                    });
                }
            }
        }
    ],
});
```
