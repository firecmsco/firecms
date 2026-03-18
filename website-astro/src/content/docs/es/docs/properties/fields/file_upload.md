---
title: Carga de archivos (File upload)
slug: es/docs/properties/fields/file_upload
---

Usa los campos de carga de archivos para permitir que los usuarios suban imágenes, documentos o cualquier
archivo a tu solución de almacenamiento (Firebase Storage de forma predeterminada). Este campo se encarga
de cargar el archivo y guardar la ruta de almacenamiento (storage path) como el valor
de tu propiedad.

:::note
Puedes guardar la URL del archivo cargado, en lugar de la ruta de almacenamiento,
configurando `storeUrl`.
:::

También puedes permitir la carga de solo algunos tipos de archivos según
el [tipo MIME](https://developer.mozilla.org/es/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
, o restringir el tamaño del archivo.

Si el archivo subido es una imagen, también puedes optar por cambiar su tamaño antes de
que se cargue en el backend de almacenamiento, con la propiedad `imageCompression`.

La lista completa de parámetros que puedes usar al cargar archivos:

* `mediaType` Tipo de medio de esta referencia, utilizado para mostrar la
  vista previa.
* `storagePath` Ruta absoluta en tu depósito (bucket). Puedes especificarla
  directamente o usar una devolución de llamada (callback).
* `acceptedFiles`
  [Tipo MIME](https://developer.mozilla.org/es/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types)
  de archivo que se puede subir a esta
  referencia. Ten en cuenta que también puedes usar la notación de asterisco, por lo que `image/*`
  acepta cualquier archivo de imagen, y así sucesivamente.
* `metadata` Metadatos específicos establecidos en el archivo cargado.
* `fileName` Puedes especificar un callback para el nombre de archivo (fileName) si necesitas
  personalizar el nombre del archivo.
* `storagePath` Puedes especificar un callback de ruta de almacenamiento (storage path) si necesitas
  personalizar la ruta donde se almacena.
* `storeUrl` Cuando se establece en `true`, este indicador señala que la URL
  de descarga del archivo se guardará en Firestore en lugar de la ruta de almacenamiento en
  Cloud Storage. Ten en cuenta que la URL generada puede usar un token que, si se
  desactiva, podría inutilizar la URL y perder la referencia original a
  Cloud Storage, por lo que no se recomienda usar esta marca. Su valor predeterminado es
  false.
* `imageCompression` Utiliza compresión y cambio de tamaño de imagen del lado del cliente.
  Solo se aplicará a estos tipos MIME: `image/jpeg`, `image/png`
  e `image/webp`.

:::note
Puedes usar algunos marcadores de posición (placeholders) en `storagePath` y `fileName` para
personalizar la ruta y el nombre del archivo. Los marcadores disponibles son:

- \{file\} - Nombre completo del archivo
- \{file.name\} - Nombre del archivo sin extensión
- \{file.ext\} - Extensión del archivo
- \{rand\} - Valor aleatorio utilizado para evitar colisiones de nombres
- \{entityId\} - ID de la entidad
- \{propertyKey\} - ID de esta propiedad
- \{path\} - Ruta de esta entidad
:::

### Carga de un solo archivo (Single file upload)

![Field](/img/fields/File_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "string",
    name: "Imagen",
    storage: {
        storagePath: "images",
        acceptedFiles: ["image/*"],
        maxSize: 1024 * 1024,
        metadata: {
            cacheControl: "max-age=1000000"
        },
        fileName: (context) => {
            return context.file.name;
        }
    }
});
```

El tipo de datos es [`string`](../config/string).

Internamente, el componente utilizado
es [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).

### Carga de múltiples archivos (Multiple file upload)

![Field](/img/fields/Multi_file_upload.png)

```typescript jsx
import { buildProperty } from "@firecms/core";

buildProperty({
    dataType: "array",
    name: "Imágenes",
    of: {
        dataType: "string",
        storage: {
            storagePath: "images",
            acceptedFiles: ["image/*"],
            metadata: {
                cacheControl: "max-age=1000000"
            }
        }
    },
    description: "Este campo permite cargar múltiples imágenes a la vez"
});
```

El tipo de datos es [`array`](../config/array).

Internamente, el componente utilizado
es [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding).

### Soporte personalizado para imágenes, videos y audio

Eres libre de usar la propiedad `storage` para subir cualquier tipo de archivo, pero
FireCMS también proporciona compatibilidad personalizada para imágenes, vídeos y audio.

No necesitas realizar ningún cambio específico y este comportamiento está habilitado de
forma predeterminada. FireCMS detectará automáticamente si el archivo es una imagen, video o
audio y mostrará la vista previa en consecuencia.

Los tipos MIME admitidos para vistas previas personalizadas son:

- `image/*`
- `video/*`
- `audio/*`

(esto incluye todos los formatos de archivo relacionados con estas categorías)
