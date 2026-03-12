---
slug: es/docs/collections/text_search
title: Búsqueda de texto (Text search)
description: Añade búsqueda de texto completo a FireCMS con Typesense o Algolia. Usa nuestra Extensión de Firebase para búsquedas tolerantes a errores tipográficos por ~$7/mes, o intégrate con Algolia para necesidades empresariales.
---

:::note[La solución descrita aquí es específica para Firestore]
Si estás desarrollando tu propia fuente de datos, eres libre de implementar la búsqueda de texto
de la manera que tenga sentido.
:::

Firestore no admite la búsqueda de texto nativa, por lo que debemos confiar en
soluciones externas. Si especificas una bandera `textSearchEnabled` en la **colección**,
verás una barra de búsqueda en la parte superior de la vista de la colección.

## Opciones de búsqueda

| Opción | Costo | Configuración | Mejor Para |
|--------|------|-------|----------|
| **Extensión de Typesense** (Recomendado) | ~$7-14/mes fijos | 5 min | La mayoría de los proyectos |
| **Algolia** | Precios por consulta | 15 min | Empresarial, geobúsqueda (geo-search) |
| **Búsqueda de texto local** | Gratis | 1 min | Colecciones pequeñas (<1000 documentos) |

---

## Usando Typesense (Recomendado)

La **Extensión Typesense de FireCMS** despliega un servidor de búsqueda Typesense en una máquina virtual de Compute Engine y sincroniza automáticamente tus datos de Firestore. Características:

- 🔍 **Búsqueda tolerante a errores tipográficos** - "auriculares" coincide con "auiriculares"
- ⚡ **Respuestas en sub-milisegundos**
- 💰 **Costo mensual fijo** - Sin cargos por consulta (per-query fees)
- 🔄 **Sincronización en tiempo real** - Los documentos se indexan automáticamente al crear/actualizar/eliminar

### Instalación

**Requisitos previos:**
- Proyecto Firebase con Firestore
- Facturación de GCP habilitada
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) instalado

**Paso 1: Instaler la extensión**

```bash
firebase ext:install https://github.com/firecmsco/typesense-extension --project=TU_ID_DE_PROYECTO
```

**Paso 2: Otorgar permisos**

```bash
export PROJECT_ID=tu-id-de-proyecto
export EXT_INSTANCE_ID=typesense-search  # Nombre predeterminado de la extensión

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/compute.admin" --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/secretmanager.admin" --condition=None

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:ext-${EXT_INSTANCE_ID}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/datastore.user" --condition=None
```

**Paso 3: Aprovisionar el servidor de búsqueda**

```bash
curl "https://REGION-PROJECT_ID.cloudfunctions.net/ext-typesense-search-provisionSearchNode"
```

Reemplaza `REGION` con la región de tus functions (ej., `us-central1`) y `PROJECT_ID` con tu proyecto.

Espera ~2 minutos. Los documentos existentes se indexarán automáticamente.

**Paso 4: (Opcional) Habilitar acceso de búsqueda público**

```bash
gcloud functions add-iam-policy-binding ext-${EXT_INSTANCE_ID}-api \
  --member="allUsers" \
  --role="roles/cloudfunctions.invoker" \
  --region=REGION \
  --project=${PROJECT_ID}
```

### Usando Typesense en FireCMS Cloud

Navega a la **Configuración del proyecto (Project Settings)** y configura:

| Configuración | Valor |
|---------|-------|
| **Región** | La región de tu extensión (ej., `us-central1`) |
| **ID de la instancia de extensión** | Por defecto: `typesense-search` |

¡Eso es todo! FireCMS Cloud se conecta automáticamente a tu instancia de Typesense.

### Usando Typesense en FireCMS auto-hospedado

```typescript
import { buildFireCMSSearchController, useFirestoreDelegate } from "@firecms/firebase";

const textSearchControllerBuilder = buildFireCMSSearchController({
  region: "us-central1",  // La región de tu extensión
  extensionInstanceId: "typesense-search"  // Nombre predeterminado
});

export function App() {
  const firestoreDelegate = useFirestoreDelegate({
    firebaseApp,
    textSearchControllerBuilder
  });
  // ... resto de tu aplicación
}
```

### Usando Typesense Directamente (Sin FireCMS)

Busca a través del endpoint (API proxy endpoint):

```typescript
const response = await fetch(
  "https://REGION-PROJECT_ID.cloudfunctions.net/ext-typesense-search-api/collections/products/documents/search",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: "auriculares inalambricos azules",
      query_by: "name,description"
    })
  }
);
const results = await response.json();
```

Ve a la [Documentación de la API Typesense](https://typesense.org/docs/latest/api/) por todos los endpoints disponibles.

---

## Usando Algolia

Algolia es un servicio de búsqueda gestionado con precios por consulta. Ideal para necesidades empresariales o funciones avanzadas como la geobúsqueda.

Necesitas definir un `FirestoreTextSearchControllerBuilder` y añadirlo a tu configuración.
Configura una cuenta de Algolia y sincroniza los documentos usando su [extensión de Firebase](https://extensions.dev/extensions/algolia/firestore-algolia-search).


### Usando Algolia en FireCMS Cloud


Proporcionamos un método de utilidad para realizar búsquedas en Algolia `performAlgoliaTextSearch`.
Necesitas importar la librería `algoliasearch` y crear un cliente de Algolia.
Luego puedes usar el método `performAlgoliaTextSearch` para ejecutar la búsqueda.

En tu controlador, puedes definir las rutas que deseas admitir y la búsqueda.
Las rutas no especificadas aún se pueden buscar con la búsqueda de texto local.

Ejemplo:

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";

import {
    performAlgoliaTextSearch,
    buildExternalSearchController,
    FirestoreTextSearchController,
    buildCollection,
    FireCMSCloudApp,
    EntityCollectionsBuilder,
    FireCMSAppConfig
} from "@firecms/cloud";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({
                       path,
                       searchString
                   }) => {
        if (path === "products") {
            return performAlgoliaTextSearch(client, "products", searchString);
        }
        return undefined;
    }
});


const appConfig: FireCMSAppConfig = {
    version: "1",
    textSearchControllerBuilder: algoliaSearchController,
    // ...
}
```

### Usando Algolia en FireCMS auto-hospedado

Para FireCMS auto-hospedado, necesitas definir un `FirestoreTextSearchControllerBuilder`.

```tsx
import { algoliasearch, SearchClient } from "algoliasearch";

import { buildExternalSearchController, performAlgoliaTextSearch } from "@firecms/firebase";

const client: SearchClient | undefined = algoliasearch("YOUR_ALGOLIA_APP_ID", "YOUR_ALGOLIA_SEARCH_KEY");

const algoliaSearchController = buildExternalSearchController({
    isPathSupported: (path) => path === "products",
    search: async ({
                       path,
                       searchString
                   }) => {
        if (path === "products")
            return performAlgoliaTextSearch(client, "products", searchString);
        return undefined;
    }
});


export function App() {

    // ...
    const firestoreDelegate = useFirestoreDelegate({
        firebaseApp,
        textSearchControllerBuilder: algoliaSearchControllerBuilder
    });
    // ...
}

```


### Búsqueda de texto local

Desde FireCMS v3 proporcionamos una implementación de búsqueda de texto local. Esto es útil
para colecciones pequeñas o cuando deseas proporcionar una forma rápida de buscar a través de
tus datos.

Sin embargo, para colecciones más grandes, querrás utilizar un proveedor de búsqueda **externo**,
como Algolia. Este es el enfoque recomendado.

Puedes usar la búsqueda de texto local en FireCMS Cloud, o en versiones alojadas por ti mismo (self-hosted).

Para FireCMS Cloud, solo necesitas habilitarlo en la interfaz de usuario (UI).

Para versiones auto-hospedadas, lo puedes habilitar agregando el `localTextSearchEnabled` en `useFirestoreDelegate`.
Luego necesitas marcar cada colección con `textSearchEnabled: true`.

Si has declarado un proveedor de indexado externo, la búsqueda de texto local será
efectiva **solamente para las aquellas rutas no admitidas por el proveedor externo**.


### Usando un proveedor de busqueda externo

Cuando utilizas un proveedor de búsqueda externo, requieres implementar un `FirestoreTextSearchController`.
