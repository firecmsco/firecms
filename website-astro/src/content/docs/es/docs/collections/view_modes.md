---
title: Modos de vista de colección (Collection View Modes)
sidebar_label: Modos de vista
description: Muestra tus colecciones como Tablas, Tarjetas o tableros Kanban en FireCMS. Elige la vista que mejor se adapte a tus datos.
---

FireCMS ofrece tres formas diferentes de visualizar tus colecciones. Cada modo de vista está optimizado para diferentes tipos de datos y flujos de trabajo.

![Modos de vista de colección](/img/blog/kanban_settings.png)

## Modos de vista disponibles

| Modo de vista | Descripción | Mejor para |
|-----------|-------------|----------|
| **Tabla (Table)** | Cuadrícula tipo hoja de cálculo con edición en línea | Datos densos, operaciones masivas, registros detallados |
| **Tarjetas (Cards)** | Cuadrícula adaptable que muestra miniaturas y campos clave | Contenido visual, catálogos de productos, bibliotecas de medios |
| **Kanban** | Tablero con columnas basadas en un campo de estado/categoría | Flujos de trabajo, gestión de tareas, canales de pedidos |

## Configurar la vista predeterminada

Utiliza la propiedad `defaultViewMode` en la configuración de tu colección:

```typescript
const productsCollection = buildCollection({
    path: "products",
    name: "Productos",
    defaultViewMode: "cards", // "table" | "cards" | "kanban"
    properties: {
        // ...
    }
});
```

Los usuarios aún pueden alternar entre vistas usando el selector de vistas en la barra de herramientas de la colección; `defaultViewMode` solo establece lo que ven primero.

---

## Restringir las vistas disponibles

Por defecto, los tres modos de vista están disponibles. Usa `enabledViews` para restringir qué vistas aparecen en el selector:

```typescript
const ordersCollection = buildCollection({
    path: "orders",
    name: "Pedidos (Orders)",
    enabledViews: ["table", "kanban"], // La vista de tarjetas no estará disponible
    properties: {
        // ...
    }
});
```

:::note
La vista Kanban está disponible automáticamente siempre que tu colección tenga al menos una propiedad de cadena (string) con `enumValues`. Si no existen propiedades de enumeración, Kanban no aparecerá en el selector incluso si se incluye en `enabledViews`.
:::

---

## Vista de Tabla (Table View)

El modo de vista predeterminado. Muestra las entidades en una cuadrícula tipo hoja de cálculo con soporte para:
- Edición en línea
- Ordenación y filtrado
- Cambio de tamaño y reordenación de columnas
- Selección masiva (bulk selection)

**Mejor para:** Listas de usuarios, registros de transacciones, datos analíticos, cualquier colección donde necesites ver muchos campos a la vez.

---

## Vista de Tarjetas (Cards View)

Transforma tu colección en una cuadrícula adaptable de tarjetas. Cada tarjeta muestra:
- Miniaturas de imágenes (detectadas automáticamente de las propiedades de imagen)
- Título y metadatos clave
- Acciones rápidas

![Ejemplo de vista de tarjetas](/img/blog/cards_view_plants.png)

### Habilitar la vista de tarjetas

```typescript
const productsCollection = buildCollection({
    path: "products",
    name: "Productos",
    defaultViewMode: "cards",
    properties: {
        name: buildProperty({ dataType: "string", name: "Nombre" }),
        image: buildProperty({ 
            dataType: "string", 
            storage: { mediaType: "image", storagePath: "products" } 
        }),
        price: buildProperty({ dataType: "number", name: "Precio" })
    }
});
```

**Mejor para:** Catálogos de productos, publicaciones de blog, bibliotecas de medios, directorios de equipos, portafolios; cualquier colección con imágenes.

---

## Vista Kanban

Muestra las entidades como tarjetas organizadas en columnas según una propiedad de enumeración (enum). Arrastra y suelta las tarjetas entre columnas para actualizar su estado.

![Vista Kanban en acción](/img/blog/kanban_view.png)

### Auto-Detección

La vista Kanban está **disponible automáticamente** para cualquier colección que tenga al menos una propiedad de cadena con `enumValues` definidos. No se requiere configuración adicional: simplemente define tu propiedad de enumeración y la opción de Tablero (Board) aparecerá en el selector de vistas.

### Configurar una propiedad de columna predeterminada

Cuando tu colección tiene múltiples propiedades de enumeración, puedes establecer cuál se usa para las columnas por defecto con la configuración `kanban`. Los usuarios pueden alternar entre propiedades de enumeración desde el selector de vistas.

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tareas",
    defaultViewMode: "kanban",
    kanban: {
        columnProperty: "status" // Opcional: preselecciona por qué enum agrupar
    },
    properties: {
        title: buildProperty({ dataType: "string", name: "Tarea" }),
        status: buildProperty({
            dataType: "string",
            name: "Estado",
            enumValues: {
                todo: "Por hacer",
                in_progress: "En progreso",
                review: "Revisión",
                done: "Hecho"
            }
        })
    }
});
```

### Reordenación arrastrar y soltar (Drag and Drop)

Para habilitar la reordenación de tarjetas dentro de una columna, añade un `orderProperty`:

```typescript
const tasksCollection = buildCollection({
    path: "tasks",
    name: "Tareas",
    defaultViewMode: "kanban",
    kanban: { columnProperty: "status" },
    orderProperty: "order", // Debe hacer referencia a una propiedad numérica
    properties: {
        title: buildProperty({ dataType: "string", name: "Tarea" }),
        status: buildProperty({
            dataType: "string",
            name: "Status",
            enumValues: { todo: "Por hacer", in_progress: "En progreso", done: "Hecho" }
        }),
        order: buildProperty({ dataType: "number", name: "Orden" })
    }
});
```

La `orderProperty` usa indexación fraccional para mantener el orden sin reescribir cada documento en cada reordenación.

:::caution[Índice de Firestore Requerido]
Cuando uses la vista Kanban con Firestore, necesitarás un índice compuesto en tu propiedad de columna. Firestore te pedirá el enlace exacto del índice cuando cargues la vista por primera vez.
:::

**Mejor para:** Gestión de tareas, cumplimiento de pedidos, canales de contenido, tickets de soporte, flujos de trabajo de contratación; cualquier colección con etapas distintas.

---

## Configuración en FireCMS Cloud

Si estás usando FireCMS Cloud, puedes configurar los modos de vista a través de la interfaz de usuario sin escribir código:

1. Abre la configuración de tu colección
2. Ve a la pestaña **Pantalla (Display)**
3. Selecciona tu **Vista de colección predeterminada (Default collection view)** (Tabla, Tarjetas o Kanban)
4. Para Kanban, elige la **Propiedad de Columna Kanban** y opcionalmente una **Propiedad de Orden**

![Configuración Kanban en FireCMS Cloud](/img/blog/kanban_settings.png)
