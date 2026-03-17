---
title: String
sidebar_label: String
description: Configuración para propiedades de tipo string en FireCMS, incluyendo almacenamiento, markdown, enumeraciones y opciones de validación.
---

La **propiedad string** es el tipo de campo más versátil en FireCMS. Úsala para todo, desde simples entradas de texto hasta subidas de archivos, editores de texto enriquecido y listas desplegables. Al construir un **panel de administración** para tu aplicación **Firebase**, las propiedades string te permiten crear:

- **Campos de texto**: Nombres, títulos, descripciones
- **Listas desplegables**: Campos de estado, categorías, opciones
- **Subidas de archivos**: Imágenes, documentos (almacenados en **Firebase Storage**)
- **Editores Markdown**: Contenido enriquecido con formato
- **Campos de email/URL**: Tipos de entrada validados

```tsx
import { buildProperty } from "@firecms/core";

const nameProperty = buildProperty({
    name: "Nombre",
    description: "Propiedad string básica con validación",
    validation: { required: true },
    dataType: "string"
});
```

### `storage`

Puedes especificar una configuración `StorageMeta`. Se usa para
indicar que este string hace referencia a una ruta en Google Cloud Storage.

* `mediaType` Tipo de medio de esta referencia, usado para mostrar la
  vista previa.
* `acceptedFiles` [Tipos MIME](https://developer.mozilla.org/es/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types) de archivos que pueden subirse a esta
  referencia. También puedes usar la notación con asterisco, por ejemplo `image/*`
  acepta cualquier archivo de imagen, etc.
* `metadata` Metadatos específicos establecidos en tu archivo subido.
* `fileName` Puedes usar este prop para personalizar el nombre del archivo subido.
  Puedes usar una función callback o una cadena donde especificas
  algunos marcadores de posición que se reemplazan con los valores correspondientes.
  - `{file}` - Nombre completo del archivo
  - `{file.name}` - Nombre del archivo sin extensión
  - `{file.ext}` - Extensión del archivo
  - `{rand}` - Valor aleatorio para evitar colisiones de nombres
  - `{entityId}` - ID de la entidad
  - `{propertyKey}` - ID de esta propiedad
  - `{path}` - Ruta de esta entidad
* `storagePath` Ruta absoluta en tu bucket.
  Puedes usar una función callback o una cadena donde especificas
  algunos marcadores de posición que se reemplazan con los valores correspondientes.
  - `{file}` - Nombre completo del archivo
  - `{file.name}` - Nombre del archivo sin extensión
  - `{file.ext}` - Extensión del archivo
  - `{rand}` - Valor aleatorio para evitar colisiones de nombres
  - `{entityId}` - ID de la entidad
  - `{propertyKey}` - ID de esta propiedad
  - `{path}` - Ruta de esta entidad
* `includeBucketUrl` Cuando se establece en `true`, FireCMS almacenará una
  URL de almacenamiento completamente cualificada en lugar de solo la ruta de almacenamiento.
  Para Firebase Storage esta es una URL `gs://...`, por ejemplo
  `gs://mi-bucket/ruta/al/archivo.png`.
  El valor predeterminado es `false`.
* `storeUrl` Cuando se establece en `true`, este indicador indica que la URL de descarga
  del archivo se guardará en Firestore en lugar de la ruta de Cloud
  Storage. Ten en cuenta que la URL generada puede usar un token que, si
  se deshabilita, puede inutilizar la URL y perder la referencia original a
  Cloud Storage, por lo que no se recomienda usar este indicador. El valor predeterminado es `false`.
* `maxSize` Tamaño máximo del archivo en bytes.
* `processFile` Usa este callback para procesar el archivo antes de subirlo.
  Si devuelves `undefined`, se sube el archivo original.
* `postProcess` Post-procesa el valor guardado (ruta de almacenamiento, URL de almacenamiento o URL de descarga)
  después de que haya sido resuelto.
* `previewUrl` Proporciona una URL de vista previa personalizada para un nombre de archivo dado.

#### Imágenes: redimensionar/comprimir antes de subir

FireCMS admite la optimización de imágenes en el lado del cliente antes de subirlas:

* `imageResize` (recomendado) Configuración avanzada de redimensionamiento y recorte de imágenes.
  Solo se aplica a imágenes (`image/jpeg`, `image/png`, `image/webp`).
  - `maxWidth`, `maxHeight`
  - `mode`: `contain` o `cover`
  - `format`: `original`, `jpeg`, `png`, `webp`
  - `quality`: 0-100

* `imageCompression` (obsoleto) Redimensionamiento/compresión de imágenes heredado.

```tsx
import { buildProperty } from "@firecms/core";

const imageProperty = buildProperty({
    dataType: "string",
    storage: {
        mediaType: "image",
        storagePath: (context) => {
            return "images";
        },
        acceptedFiles: ["image/*"],
        fileName: (context) => {
            return context.file.name;
        },
        includeBucketUrl: true,
        imageResize: {
            maxWidth: 1200,
            maxHeight: 1200,
            mode: "cover",
            format: "webp",
            quality: 85
        }
    }
});
```

### `url`

Si el valor de esta propiedad es una URL, puedes establecer este indicador
en `true` para añadir un enlace, o uno de los tipos de medios admitidos para renderizar una
vista previa.

```tsx
import { buildProperty } from "@firecms/core";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Enlace de Amazon",
    url: true
});
```

También puedes definir el tipo de vista previa para la URL: `image`, `video` o `audio`:

```tsx
import { buildProperty } from "@firecms/core";

const imageProperty = buildProperty({
    name: "Imagen",
    dataType: "string",
    url: "image",
});
```

### `email`

Si se establece en `true`, este campo se validará como una dirección de correo electrónico y
se renderizará con una entrada específica para email. Esto es útil para formularios de contacto,
perfiles de usuario o cualquier campo que deba contener un correo electrónico válido.

```tsx
import { buildProperty } from "@firecms/core";

const emailProperty = buildProperty({
    name: "Correo electrónico",
    dataType: "string",
    email: true
});
```

### `userSelect`

Esta propiedad se usa para indicar que el string es un **ID de usuario**, y
se renderizará como un selector de usuarios. Ten en cuenta que el ID de usuario debe ser el
que se usa en tu proveedor de autenticación, por ejemplo Firebase Auth.
También puedes usar un constructor de propiedades para especificar la ruta de usuario dinámicamente
según otros valores de la entidad.

```tsx
import { buildProperty } from "@firecms/core";

const assignedUserProperty = buildProperty({
    name: "Usuario asignado",
    dataType: "string",
    userSelect: true
});
```

### `enumValues`

Puedes usar los valores de enumeración proporcionando un mapa de posibles valores exclusivos que la
propiedad puede tomar, mapeados a la etiqueta que se muestra en el desplegable. Puedes
usar un objeto simple con el formato `valor` => `etiqueta`, o con el formato `valor`
=> [`EnumValueConfig`](../../api/type-aliases/EnumValueConfig) si necesitas
personalización adicional, (como deshabilitar opciones específicas o asignar colores). Si
necesitas garantizar el orden de los elementos, puedes pasar un `Map` en lugar de un
objeto simple.

```tsx
import { buildProperty } from "@firecms/core";

const amazonLinkProperty = buildProperty({
    dataType: "string",
    name: "Enlace de Amazon",
    enumValues: {
        "es": "Español",
        "de": "Alemán",
        "en": "Inglés",
        "it": "Italiano",
        "fr": {
            id: "fr",
            label: "Francés",
            disabled: true
        }
    }
});
```

### `multiline`

¿Es esta propiedad string lo suficientemente larga como para mostrarse
en un campo de múltiples líneas? El valor predeterminado es false. Si se establece en `true`, el número
de líneas se adapta al contenido.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    name: "Descripción",
    dataType: "string",
    multiline: true
});
```

### `clearable`

Añade un icono para borrar el valor y establecerlo a `null`. El valor predeterminado es `false`.

### `markdown`

¿Debe mostrarse esta propiedad string como un campo markdown?
Si es `true`, el campo se renderiza como un editor de texto que admite el
resaltado de sintaxis markdown. También incluye una vista previa del resultado.

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    dataType: "string",
    name: "Texto",
    markdown: true
});
```

### `previewAsTag`

¿Debe renderizarse este string como una etiqueta en lugar de solo texto?

```tsx
import { buildProperty } from "@firecms/core";

const property = buildProperty({
    name: "Etiquetas",
    description: "Ejemplo de array genérico",
    dataType: "array",
    of: {
        dataType: "string",
        previewAsTag: true
    }
});
```

### `validation`

* `required` ¿Debe ser obligatorio este campo?
* `requiredMessage` Mensaje que se mostrará como error de validación.
* `unique` El valor de este campo debe ser único en esta colección.
* `uniqueInArray` Si se establece en `true`, el usuario solo podrá
  tener el valor de esa propiedad una vez en el
  `ArrayProperty` padre. Funciona en propiedades hijas directas o en hijos de primer nivel
  de una `MapProperty` (si se establece como la propiedad `.of` del
  `ArrayProperty`).
* `length` Establece una longitud requerida para el valor string.
* `min` Establece un límite mínimo de longitud para el valor string.
* `max` Establece un límite máximo de longitud para el valor string.
* `matches` Proporciona una expresión regular arbitraria para validar el valor.
* `email` Valida el valor como una dirección de correo electrónico mediante una expresión regular.
* `url` Valida el valor como una URL válida mediante una expresión regular.
* `trim` Transforma los valores string eliminando los espacios en blanco al principio y al final.
* `lowercase` Transforma el valor string a minúsculas.
* `uppercase` Transforma el valor string a mayúsculas.

---

Según tu configuración, los widgets de campo de formulario que se crean son:

- [`TextFieldBinding`](../../api/functions/TextFieldBinding) campo de texto genérico
- [`SelectFieldBinding`](../../api/functions/SelectFieldBinding) si se establecen `enumValues`
  en la configuración del string, este campo renderiza un selector
  donde cada opción es una chip coloreada.
- [`StorageUploadFieldBinding`](../../api/functions/StorageUploadFieldBinding)
  la propiedad tiene una
  configuración de almacenamiento.
- [`MarkdownEditorFieldBinding.`](../../api/functions/MarkdownEditorFieldBinding) la
  propiedad tiene una
  configuración markdown.

Enlaces:

- [API](../../api/interfaces/StringProperty)
