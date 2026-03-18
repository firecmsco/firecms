---
title: Colecciones (Collections)
slug: es/docs/collections/index
sidebar_label: Colecciones
description: Define tu esquema de datos de Firestore con las colecciones de FireCMS. Construye paneles de administración con seguridad de tipos para Firebase con React y TypeScript.
---

Las **Colecciones** son los bloques de construcción centrales de tu **panel de administración** en FireCMS. Definen cómo se muestran, editan y gestionan tus **datos de Firestore** en la interfaz del CMS.

Si estás construyendo un **CMS headless** o un **back-office** para tu proyecto **Firebase**, las colecciones son el lugar donde defines:
- **Qué datos** pueden administrar los usuarios (productos, usuarios, artículos, pedidos, etc.)
- **Cómo se ven esos datos** en formularios y tablas (tipos de campo, validación, diseño)
- **Quién puede hacer qué** (permisos de creación, lectura, actualización y eliminación)
- **Lógica personalizada** (devoluciones de llamada al guardar, campos calculados, efectos secundarios)

:::tip[¿Por qué usar colecciones de FireCMS?]
A diferencia de los CMS tradicionales que imponen un modelo de datos rígido, las colecciones de FireCMS se asignan directamente a tu estructura de **Firestore** existente. Esto significa que puedes agregar una poderosa **interfaz de administración basada en React** a cualquier proyecto de Firebase sin migrar tus datos o cambiar tu esquema.
:::

Las colecciones aparecen en el **nivel superior** de la navegación (página de inicio y cajón (drawer)), o como **subcolecciones** anidadas debajo de entidades principales (parent entities).

Puedes definir colecciones de dos maneras:
- **Sin código (No-code)**: Usando la **interfaz de usuario del editor de colecciones (Collection Editor UI)** incorporada (requiere los permisos adecuados)
- **Centrado en código (Code-first)**: Definiendo colecciones programáticamente con compatibilidad completa con **TypeScript** y acceso a todas las funciones avanzadas (callbacks, campos personalizados, propiedades calculadas)

## Definiendo tus colecciones

Puedes crear tus colecciones **en la interfaz de usuario (UI) o usando código**. También puedes mezclar ambos enfoques, pero ten en cuenta que
las colecciones definidas en la interfaz de usuario tendrán prioridad. Por ejemplo, podrías tener una propiedad `enum` con 2 valores definidos
en el código y un valor adicional definido en la interfaz de usuario. Cuando se combinan, el `enum` resultante tendrá 3 valores.

:::important
Puedes tener la misma colección definida de ambas formas. En ese caso, la colección definida en la interfaz de usuario
tendrá prioridad.

Se realiza una combinación profunda (deep merge), para que puedas definir algunas propiedades en el código y anularlas (override) en la interfaz de usuario. Por ejemplo, puedes
definir una propiedad de `string enum` y los valores se combinarán a partir de ambas definiciones.
:::

### Ejemplo de colección definida en código

:::note
FireCMS proporciona alrededor de 20 campos diferentes (como campos de texto, selectores y campos complejos como de referencia o
campos de matrices ordenables). Si tu caso de uso no está cubierto por uno de los campos proporcionados, puedes crear tu
propio [campo personalizado](../properties/custom_fields.mdx).
:::

:::tip
No necesitas usar `buildCollection` o `buildProperty` para construir la configuración. Son funciones de identidad
que te ayudarán a detectar errores de tipado y configuración
:::

```tsx
import { buildCollection, buildProperty, EntityReference } from "@firecms/core";

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

const productsCollection = buildCollection<Product>({
  id: "products",
  path: "products",
  name: "Productos",
  group: "Principal",
  description: "Lista de los productos que se venden actualmente en nuestra tienda",
  textSearchEnabled: true,
  openEntityMode: "side_panel",
  properties: {
    name: buildProperty({
      dataType: "string",
      name: "Nombre",
      validation: { required: true }
    }),
    main_image: buildProperty({
      dataType: "string",
      name: "Imagen",
      storage: {
        mediaType: "image",
        storagePath: "images",
        acceptedFiles: ["image/*"],
        metadata: {
          cacheControl: "max-age=1000000"
        }
      },
      description: "Campo de carga para imágenes",
      validation: {
        required: true
      }
    }),
    available: buildProperty({
      dataType: "boolean",
      name: "Disponible",
      columnWidth: 100
    }),
    price: buildProperty(({ values }) => ({
      dataType: "number",
      name: "Precio",
      validation: {
        requiredMessage: "Debes establecer un precio entre 0 y 1000",
        min: 0,
        max: 1000
      },
      disabled: !values.available && {
        clearOnDisabled: true,
        disabledMessage: "Solo puedes establecer el precio de los artículos disponibles"
      },
      description: "Precio con validación de rango"
    })),
    related_products: buildProperty({
      dataType: "array",
      name: "Productos relacionados",
      description: "Referencia a sí mismo",
      of: {
        dataType: "reference",
        path: "products"
      }
    }),
    publisher: buildProperty({
      name: "Editor (Publisher)",
      description: "Este es un ejemplo de una propiedad map",
      dataType: "map",
      properties: {
        name: {
          name: "Nombre",
          dataType: "string"
        },
        external_id: {
          name: "ID Externo",
          dataType: "string"
        }
      }
    })
  },
  permissions: ({
                  user,
                  authController
                }) => ({
    edit: true,
    create: true,
    delete: false
  })
});
```

En FireCMS Cloud, esta colección se puede usar luego incluyéndola en la propiedad `collections` de tu exportación principal,
un objeto `FireCMSAppConfig`.

En FireCMS PRO, las colecciones (`collections`) se pasan directamente al hook `useBuildNavigationController`.

### Modificación de una colección definida en la interfaz de usuario

Si solo necesitas agregar algo de código a una colección definida en la interfaz de usuario, puedes usar la función `modifyCollection` en
tu objeto `FireCMSAppConfig`.

Esto se aplica a **FireCMS Cloud** solamente.

```tsx
import { FireCMSAppConfig } from "@firecms/core";

const appConfig: FireCMSAppConfig = {
    version: "1",
    collections: async (props) => {
        return ([
            // ... las colecciones definidas por código completo aquí
        ]);
    },
    modifyCollection: ({ collection }) => {
        if (collection.id === "products") {
            return {
                ...collection,
                name: "Productos modificados",
                entityActions: [
                    {
                        name: "Acción de entidad de muestra",
                        onClick: ({ entity }) => {
                            console.log("Entidad", entity);
                        }
                    }
                ]
            }
        }
        return collection;
    }
}

export default appConfig;
```

Puedes usar todos los atributos (props) disponibles en la interfaz `Collection`.

## Subcolecciones

Las subcolecciones son colecciones de entidades que se encuentran bajo otra entidad. Por ejemplo, puedes tener una colección
llamada "traducciones" bajo la entidad "Artículo". Solo necesitas usar el mismo formato que para definir tu colección
usando el campo `subcollections`.

Las subcolecciones son fácilmente accesibles desde la vista lateral (side view) mientras se edita una entidad.

## Filtros

:::tip
Si necesitas tener algunos filtros y ordenar aplicados por defecto, puedes usar la propiedad `initialFilter` e `initialSort`. 
También puedes forzar que una combinación de filtros siempre se aplique mediante la propiedad `forceFilter`.
:::

El filtrado está habilitado por defecto para cadenas de texto, números, booleanos, fechas y matrices (arrays). Un menú desplegable se incluye en cada
columna de la colección donde corresponda.

Dado que Firestore tiene capacidades de consulta limitadas, cada vez que aplicas un filtro o un nuevo ordenamiento a un dato distinto, la combinación previa 
se restablece por defecto (a menos de estar filtrando u ordenando la misma propiedad).

Si necesitas habilitar el filtrado/ordenamiento por más de una propiedad al mismo tiempo, puedes especificar los filtros que has
habilitado en la configuración de Firestore. Para ello, solo debes pasar la configuración de `indexes` a tu colección:

```tsx
import { buildCollection } from "@firecms/core";

const productsCollection = buildCollection<Product>({
    id: "products",
    path: "products",
    name: "Product",
    properties: {
        // ...
    },
    indexes: [
        {
            price: "asc",
            available: "desc"
        }
    ]
});

## Configuración de colección

El nombre (`name`) y propiedades (`properties`) que definas para el esquema de tu entidad se emplearán para generar los campos en la vista de tabla tipo hoja de cálculo, así como los campos en los formularios generados.

:::tip
Puedes forzar que el CMS siempre abra el formulario al editar un documento configurando la propiedad `inlineEditing`
como `false` en la configuración de la colección.
:::

- **`name`**: El nombre plural de la colección. Por ejemplo, 'Productos'.
- **`singularName`**: El nombre en singular de una entrada de la colección. Por ejemplo, 'Producto'.
- **`path`**: Ruta relativa en Firestore de esta vista a su elemento padre. Si la vista está en la raíz, la ruta es igual a la absoluta. Esta ruta también determina la URL en FireCMS.
- **`properties`**: Objeto que define las propiedades del esquema de la entidad. Más información en [Propiedades](../properties/properties_intro).
- **`propertiesOrder`**: Orden en el que se muestran las propiedades.
    - Para las propiedades, usa la clave de la propiedad.
    - Para un campo adicional, usa la clave del campo.
    - Si tienes subcolecciones, obtendrás una columna por cada subcolección, identificada con la ruta (o alias) con el prefijo `subcollection:`. Por ejemplo, `subcollection:orders`.
    - Si usas un grupo de colección, también tendrás una columna adicional `collectionGroupParent`.
    - Ten en cuenta que si usas esta propiedad, otras formas de ocultar campos (como `hidden` en la definición de la propiedad) serán ignoradas. `propertiesOrder` tiene precedencia sobre `hidden`.

  ```typescript
  propertiesOrder: ["name", "price", "subcollection:orders"]
  ```

- **`openEntityMode`**: Determina cómo se abre la vista de la entidad. Puedes elegir entre `side_panel` (por defecto) o `full_screen`.
- **`formAutoSave`**: Si se establece en `true`, el formulario se guardará automáticamente cuando el usuario cambie el valor de un campo. Por defecto es `false`. No puedes usar esta propiedad junto con `customId`.
- **`collectionGroup`**: Si esta colección es una entrada de navegación de nivel superior, puedes establecer esta propiedad en `true` para indicar que es un grupo de colecciones.
- **`alias`**: Puedes establecer un alias que se usará internamente en lugar de `path`. El valor de `alias` determinará la URL de la colección, mientras que `path` seguirá usándose en el origen de datos. Ten en cuenta que también puedes usar este valor en propiedades de referencia.
- **`icon`**: Ícono de la colección. Puedes usar cualquiera de los íconos de Material Design: [Material Icons](https://fonts.google.com/icons). Por ejemplo, `'account_tree'` o `'person'`.
  Explora todos los íconos en [Íconos](https://firecms.co/docs/icons).
  También puedes pasar tu propio componente de ícono (`React.ReactNode`).
- **`customId`**: Si no se establece esta propiedad, el ID del documento será generado por el origen de datos. Puedes establecerlo en `true` para obligar a los usuarios a elegir el ID.
- **`subcollections`**: Siguiendo el esquema de documentos y colecciones de Firestore, puedes añadir subcolecciones a tu entidad de la misma manera que defines las colecciones raíz.
- **`defaultSize`**: Tamaño por defecto de la colección renderizada.
- **`group`**: Campo opcional para agrupar entradas de navegación de nivel superior. Si se usa en una subcolección, no tiene efecto.
- **`description`**: Descripción opcional de esta vista. Admite Markdown.
- **`entityActions`**: Puedes definir acciones adicionales sobre las entidades de esta colección. Estas acciones pueden mostrarse en la vista de colección o en la vista de entidad. Usa el método `onClick` para implementar tu propia lógica. En el objeto `context`, puedes acceder a todos los controladores de FireCMS.
  También puedes definir acciones de entidad de forma global. Consulta [Acciones de entidad](./entity_actions) para más detalles.

```tsx
const archiveEntityAction: EntityAction = {
    icon: <ArchiveIcon/>,
    name: "Archivar",
    onClick({
                entity,
                collection,
                context
            }): Promise<void> {
        // Añade tu código aquí
        return Promise.resolve(undefined);
    }
}
```

- **`initialFilter`**: Filtros iniciales aplicados a esta colección. Por defecto no hay ninguno. El usuario puede modificar estos filtros.

```tsx
initialFilter: {
    age: [">=", 18]
}
```
```tsx
initialFilter: {
    related_user: ["==", new EntityReference("sdc43dsw2", "users")]
}
```

- **`forceFilter`**: Fuerza un filtro en esta vista. Si se aplica, el resto de filtros estarán desactivados y el usuario no podrá modificarlos.
 
```tsx
forceFilter: {
    age: [">=", 18]
}
```
```tsx
forceFilter: {
    related_user: ["==", new EntityReference("sdc43dsw2", "users")]
}
```

- **`initialSort`**: Orden inicial aplicado a esta colección. Acepta tuplas con la forma `["nombre_propiedad", "asc"]`
  o `["nombre_propiedad", "desc"]`.

```tsx
initialSort: ["price", "asc"]
```

- **`Actions`**: Constructor para renderizar componentes adicionales (como botones) en la barra de herramientas de la colección. Recibe un objeto con las propiedades `entityCollection` y `selectedEntities`, si el usuario ha seleccionado alguna.

- **`pagination`**: Si está habilitado, el contenido se carga en lotes. Si es `false`, se cargan todas las entidades de la colección. Al llegar al final de la lista, el CMS cargará más entidades.
  Puedes especificar un número para definir el tamaño de página (50 por defecto).
  Por defecto es `true`.
- **`additionalFields`**: Puedes añadir campos adicionales tanto a la vista de colección como al formulario implementando un delegado de campo adicional.
- **`textSearchEnabled`**: Indica si debe mostrarse una barra de búsqueda en la parte superior de la tabla de la colección.
- **`permissions`**: Puedes especificar un objeto con permisos booleanos con la forma `{edit:boolean; create:boolean; delete:boolean}` para indicar las acciones que el usuario puede realizar. También puedes pasar un [`PermissionsBuilder`](../api/type-aliases/PermissionsBuilder) para personalizar los permisos según el usuario o la entidad.
- **`inlineEditing`**: ¿Pueden editarse los elementos de esta colección directamente en la vista de tabla? Si es `false` pero `permissions.edit` es `true`, las entidades aún pueden editarse en el panel lateral.
- **`selectionEnabled`**: ¿Son seleccionables las entidades de esta colección? Por defecto es `true`.
- **`selectionController`**: Pasa tu propio controlador de selección si quieres controlar las entidades seleccionadas externamente. [Ver `useSelectionController`](../api/functions/useSelectionController).
- **`exportable`**: ¿Debe incluirse un botón de exportación en esta vista de colección? También puedes pasar un objeto de configuración [`ExportConfig`](../api/interfaces/ExportConfig) para personalizar la exportación y añadir valores adicionales. Por defecto es `true`.
- **`hideFromNavigation`**: ¿Debe ocultarse esta colección del panel de navegación principal si está en el nivel raíz, o del panel lateral si es una subcolección? Seguirá siendo accesible si navegas directamente a la ruta especificada. También puedes usarla como destino de referencia.
- **`callbacks`**: Define los callbacks que se ejecutan cuando se crea, actualiza o elimina una entidad. Útil para añadir lógica personalizada o bloquear la operación. [Más información](./callbacks).
- **`entityViews`**: Array de constructores para renderizar paneles adicionales en la vista de una entidad. Útil para mostrar vistas personalizadas. [Más información](./entity_views).
- **`alwaysApplyDefaultValues`**: Si es `true`, los valores por defecto de las propiedades se aplicarán a la entidad cada vez que se actualice (no solo al crearse).
  Por defecto es `false`.
- **`databaseId`**: ID de base de datos opcional para esta colección. Si no se especifica, se usará el ID de base de datos por defecto. Útil cuando se trabaja con múltiples bases de datos.
- **`previewProperties`**: Propiedades de vista previa mostradas por defecto cuando se referencia esta colección.
- **`titleProperty`**: Propiedad de título de la entidad. Se usará como título en las vistas de entidad y referencias. Si no se especifica, se usará la primera propiedad de texto simple.
- **`defaultSelectedView`**: Si quieres abrir vistas personalizadas o subcolecciones por defecto al abrir una entidad, especifica la ruta aquí. Puede ser una cadena de texto o una función constructora.
- **`hideIdFromForm`**: Indica si el ID de esta colección debe ocultarse en la vista de formulario.
- **`hideIdFromCollection`**: Indica si el ID de esta colección debe ocultarse en la vista de cuadrícula.
- **`sideDialogWidth`**: Ancho del diálogo lateral (en píxeles o como cadena de texto) al abrir una entidad de esta colección.
- **`editable`**: ¿Puede el usuario final editar la configuración de esta colección? Por defecto es `true`.
  Solo tiene efecto si usas el editor de colecciones.
- **`includeJsonView`**: Si es `true`, se incluirá una pestaña con la representación JSON de la entidad.
- **`history`**: Si es `true`, los cambios en la entidad se guardarán en una subcolección.
  Esta propiedad no tiene efecto si el plugin de historial no está habilitado.
- **`localChangesBackup`**: Indica si se deben hacer copias de seguridad locales de los cambios para evitar pérdida de datos.
  Opciones: `"manual_apply"` (solicita restaurar al usuario), `"auto_apply"` (restaura automáticamente), o `false`. Por defecto es `"manual_apply"`.
- **`defaultViewMode`**: Modo de vista por defecto para mostrar esta colección.
  Opciones: `"table"` (estilo hoja de cálculo, por defecto), `"cards"` (cuadrícula de tarjetas con miniaturas), `"kanban"` (tablero agrupado por propiedad).
- **`kanban`**: Configuración para el modo de vista Kanban. Requiere una propiedad `columnProperty` que referencie una propiedad de tipo enum.
  Al configurarse, el modo de vista Kanban queda disponible.
  
```tsx
kanban: {
    columnProperty: "status" // Debe referenciar una propiedad de tipo string con enumValues
}
```

- **`orderProperty`**: Clave de propiedad usada para ordenar los elementos. Debe referenciar una propiedad de tipo número.
  Cuando se reordenan elementos, esta propiedad se actualiza para reflejar el nuevo orden usando indexación fraccionaria.
  Utilizada por la vista Kanban para ordenar elementos dentro de las columnas.
