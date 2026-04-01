---
slug: es/docs/self/security_best_practices
title: Mejores prácticas de seguridad para FireCMS self-hosted
sidebar_label: Mejores prácticas de seguridad
description: Guía completa para asegurar tu despliegue self-hosted de FireCMS cuando usas un backend personalizado con MongoDB, autenticación propia y almacenamiento de archivos personalizado.
---

FireCMS es una **aplicación React exclusivamente de frontend**. No tiene ningún componente de servidor integrado que aplique seguridad. Esto significa que **toda la seguridad debe implementarse y aplicarse en tu backend**. Los permisos del lado del cliente de FireCMS (el callback `permissions` en las colecciones) controlan la UI/UX — ocultan botones y deshabilitan formularios — pero pueden ser eludidos por cualquier usuario con acceso a las herramientas de desarrollador del navegador.

Esta guía cubre todo lo que necesitas saber para asegurar tu despliegue self-hosted de FireCMS cuando usas **MongoDB**, **autenticación personalizada** y **almacenamiento de archivos personalizado** — sin Firebase.

:::caution[Regla de oro]
**Nunca confíes en el cliente.** Cada operación que lee, escribe o elimina datos debe ser validada y autorizada en tu servidor. Las verificaciones del lado del cliente son solo para la experiencia de usuario.
:::

---

## Visión general de la arquitectura

Un despliegue self-hosted seguro de FireCMS tiene la siguiente arquitectura:

```
┌─────────────────┐       HTTPS        ┌──────────────────┐
│  FireCMS React  │ ──────────────────▶ │  Tu servidor API │
│   (Navegador)   │ ◀────────────────── │  (Express/Nest)  │
└─────────────────┘                     └──────┬───────────┘
                                               │
                        ┌──────────────────────┤
                        │                      │
                 ┌──────▼──────┐       ┌───────▼──────┐
                 │   MongoDB   │       │ Almacenamiento│
                 │  (Base de   │       │  de archivos  │
                 │   datos)    │       │  (S3/Minio)   │
                 └─────────────┘       └──────────────┘
```

Puntos clave:
- El navegador **nunca** se comunica directamente con MongoDB o tu backend de almacenamiento.
- Tu servidor API es el punto de entrada único que autentica cada solicitud, autoriza la acción, valida las entradas, y luego interactúa con la base de datos y el almacenamiento.

---

## 1. Implementar un AuthController seguro

La interfaz `AuthController` gestiona el estado de autenticación del usuario en el navegador. Cuando usas un backend personalizado, tu implementación debe ser un hook de React que se comunique con tu propia API.

### Resumen de la interfaz

```typescript
type AuthController<USER extends User = any> = {
  user: USER | null;
  initialLoading?: boolean;
  authLoading: boolean;
  signOut: () => Promise<void>;
  authError?: any;
  getAuthToken: () => Promise<string>;
  loginSkipped: boolean;
  extra: any;
  setExtra: (extra: any) => void;
};
```

### Mejores prácticas

#### Gestión de tokens (`getAuthToken`)

Tu implementación de `getAuthToken` es la piedra angular de todo el modelo de seguridad — cada solicitud que tu `DataSourceDelegate` y `StorageSource` realicen la llamará para adjuntar credenciales.

```typescript
import { useState, useCallback, useEffect } from "react";
import type { AuthController, User } from "@firecms/core";

interface CustomUser extends User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId: string;
  isAnonymous: boolean;
}

export function useCustomAuthController(): AuthController<CustomUser> {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [extra, setExtra] = useState<any>(null);

  // Al montar, verificar si existe una sesión
  useEffect(() => {
    checkSession().finally(() => setInitialLoading(false));
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setAccessToken(data.accessToken);
      }
    } catch {
      // Sin sesión válida
    }
  }, []);

  const getAuthToken = useCallback(async (): Promise<string> => {
    if (!accessToken) throw new Error("No autenticado");
    return accessToken;
  }, [accessToken]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
    setAccessToken(null);
  }, []);

  return {
    user,
    authLoading,
    initialLoading,
    signOut,
    getAuthToken,
    loginSkipped: false,
    extra,
    setExtra,
  };
}
```

**Puntos clave de seguridad:**

| Aspecto | Recomendación |
|---|---|
| **Almacenamiento de tokens** | Almacena los JWT en cookies `httpOnly`, `Secure`, `SameSite=Strict` cuando sea posible. Si debes usar tokens en memoria, nunca los guardes en `localStorage` o `sessionStorage`. |
| **Expiración de tokens** | Usa tokens de acceso de corta duración (5–15 minutos) con un flujo de refresh token. |
| **Renovación de tokens** | Implementa la renovación transparente de tokens en `getAuthToken` antes de que expiren. |
| **Invalidación de sesión** | `signOut` debe llamar a tu servidor para invalidar el refresh token / sesión. Un cierre de sesión solo del lado del cliente no es seguro. |
| **Carga inicial** | Usa `initialLoading` para verificar silenciosamente si existe una sesión al montar la app. |

#### Función Authenticator

El callback `Authenticator` te permite controlar **qué usuarios autenticados pueden acceder a FireCMS**. Úsalo para cargar el rol del usuario desde tu base de datos y adjuntarlo al controller de autenticación.

```typescript
import type { Authenticator } from "@firecms/core";

const myAuthenticator: Authenticator<CustomUser> = async ({
  user,
  authController,
  dataSourceDelegate
}) => {
  if (!user?.email) return false;

  try {
    const users = await dataSourceDelegate.fetchCollection({
      path: "cms_users",
      filter: { email: ["==", user.email] }
    });

    if (users.length === 0) return false;

    const profile = users[0].values;
    authController.setExtra({ role: profile.role });
    return true;
  } catch (error) {
    console.error("Error de autenticación:", error);
    return false;
  }
};
```

:::tip
Este callback se ejecuta en el cliente. **Tu servidor API debe verificar independientemente que el usuario solicitante tiene el rol declarado** en cada solicitud. El `Authenticator` es solo para control de la interfaz.
:::

---

## 2. Asegurar tu DataSourceDelegate (MongoDB)

El `DataSourceDelegate` es la interfaz que FireCMS usa para leer y escribir datos. Cuando está respaldado por MongoDB, tu implementación debe **proxear cada llamada a través de tu servidor API autenticado**.

### Nunca expongas MongoDB al navegador

Esta es la regla más crítica. No uses el driver de MongoDB, el SDK de Realm, ni ninguna conexión directa a la base de datos en el navegador.

```typescript
// ❌ PELIGROSO — acceso directo a MongoDB desde el navegador
import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb+srv://user:password@cluster...");

// ✅ CORRECTO — proxear a través de tu API autenticada
const response = await fetch("/api/data/products", {
  headers: { Authorization: `Bearer ${await authController.getAuthToken()}` }
});
```

### Ejemplo: DataSourceDelegate seguro

```typescript
import type {
  DataSourceDelegate,
  Entity,
  FetchCollectionDelegateProps,
  FetchEntityProps,
  SaveEntityDelegateProps,
  DeleteEntityProps
} from "@firecms/core";

export function useSecureMongoDelegate(
  getAuthToken: () => Promise<string>
): DataSourceDelegate {

  async function authenticatedFetch(url: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (res.status === 401 || res.status === 403) {
      throw new Error("No autorizado");
    }
    if (!res.ok) {
      throw new Error(`Error de API: ${res.status}`);
    }
    return res.json();
  }

  return {
    key: "secure-mongo",
    initialised: true,

    async fetchCollection<M extends Record<string, any>>({
      path, filter, limit, startAfter, orderBy, order, searchString
    }: FetchCollectionDelegateProps<M>): Promise<Entity<M>[]> {
      const params = new URLSearchParams();
      if (limit) params.set("limit", String(limit));
      if (orderBy) params.set("orderBy", orderBy);
      if (order) params.set("order", order);
      if (searchString) params.set("q", searchString);
      if (filter) params.set("filter", JSON.stringify(filter));
      if (startAfter) params.set("startAfter", JSON.stringify(startAfter));

      return authenticatedFetch(`/api/data/${path}?${params}`);
    },

    async fetchEntity<M extends Record<string, any>>({
      path, entityId
    }: FetchEntityProps<M>): Promise<Entity<M> | undefined> {
      return authenticatedFetch(`/api/data/${path}/${entityId}`);
    },

    async saveEntity<M extends Record<string, any>>({
      path, entityId, values, status
    }: SaveEntityDelegateProps<M>): Promise<Entity<M>> {
      const method = status === "new" ? "POST" : "PUT";
      const url = entityId
        ? `/api/data/${path}/${entityId}`
        : `/api/data/${path}`;
      return authenticatedFetch(url, {
        method,
        body: JSON.stringify({ values })
      });
    },

    async deleteEntity<M extends Record<string, any>>({
      entity
    }: DeleteEntityProps<M>): Promise<void> {
      await authenticatedFetch(`/api/data/${entity.path}/${entity.id}`, {
        method: "DELETE"
      });
    },

    async checkUniqueField(
      path: string, name: string, value: any, entityId?: string
    ): Promise<boolean> {
      const result = await authenticatedFetch(
        `/api/data/${path}/check-unique`,
        {
          method: "POST",
          body: JSON.stringify({ field: name, value, entityId })
        }
      );
      return result.unique;
    },

    generateEntityId(): string {
      return crypto.randomUUID();
    },

    delegateToCMSModel: (data: any) => data,
    cmsToDelegateModel: (data: any) => data,
  };
}
```

### Lista de verificación de seguridad del servidor

Tu servidor API (ej. Express, Fastify, NestJS) debe aplicar lo siguiente en **cada** solicitud:

#### Autenticación

```typescript
// Ejemplo de middleware Express
import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token faltante" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
```

#### Autorización

```typescript
function authorize(requiredRole: string) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "No autenticado" });

    if (user.role !== "admin" && user.role !== requiredRole) {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }
    next();
  };
}

app.delete("/api/data/:path/:id", authenticate, authorize("admin"), async (req, res) => {
  // Solo los administradores pueden eliminar
});
```

#### Validación de entrada y prevención de inyección NoSQL

MongoDB es vulnerable a la inyección NoSQL cuando la entrada del usuario se pasa directamente a operadores de consulta.

```typescript
// ❌ VULNERABLE — la entrada del usuario va directamente a la consulta
app.get("/api/data/:collection", async (req, res) => {
  const filter = JSON.parse(req.query.filter); // el atacante puede inyectar {$gt: ""}
  const docs = await db.collection(req.params.collection).find(filter).toArray();
  res.json(docs);
});

// ✅ SEGURO — sanitizar y usar lista blanca
import mongo from "mongo-sanitize";

app.get("/api/data/:collection", authenticate, async (req, res) => {
  // 1. Lista blanca de colecciones permitidas
  const allowedCollections = ["products", "orders", "categories"];
  if (!allowedCollections.includes(req.params.collection)) {
    return res.status(400).json({ error: "Colección inválida" });
  }

  // 2. Sanitizar el filtro para eliminar operadores de MongoDB
  let filter = {};
  if (req.query.filter) {
    filter = mongo.sanitize(JSON.parse(req.query.filter));
  }

  // 3. Aplicar límites
  const limit = Math.min(parseInt(req.query.limit) || 25, 100);

  const docs = await db
    .collection(req.params.collection)
    .find(filter)
    .limit(limit)
    .toArray();

  res.json(docs);
});
```

**Validaciones clave:**

| Verificación | Por qué |
|---|---|
| **Lista blanca de colecciones** | Prevenir acceso a colecciones del sistema (`admin`, `local`) o colecciones internas |
| **Sanitizar operadores de filtro** | Bloquear `$where`, `$gt`, `$regex` y otros operadores que pueden ser inyectados |
| **Limitar tamaño de resultados** | Prevenir denegación de servicio mediante consultas sin límite |
| **Validar campos de `orderBy`** | Solo permitir ordenamiento en campos indexados/conocidos |
| **Validar formato de `entityId`** | Asegurar que los IDs coincidan con el formato esperado (ej. UUID o patrón ObjectId) |
| **Validar `values` al guardar** | Ejecutar validación de esquema (ej. Zod, Joi) en el servidor antes de escribir |

---

## 3. Asegurar tu StorageSource

La interfaz `StorageSource` maneja la subida y descarga de archivos. Cuando usas almacenamiento personalizado (S3, MinIO, GCS, o un sistema de archivos local), el principio clave es: **nunca expongas credenciales de almacenamiento al navegador**.

### Resumen de la interfaz

```typescript
interface StorageSource {
  uploadFile: (props: UploadFileProps) => Promise<UploadFileResult>;
  getDownloadURL: (pathOrUrl: string, bucket?: string) => Promise<DownloadConfig>;
  getFile: (path: string, bucket?: string) => Promise<File | null>;
  deleteFile: (path: string, bucket?: string) => Promise<void>;
  list: (path: string, options?: { ... }) => Promise<StorageListResult>;
}
```

### Usa URLs pre-firmadas para subidas

En lugar de pasar credenciales de S3/GCS al navegador, haz que tu servidor genere URLs pre-firmadas de corta duración:

```typescript
import type { StorageSource, UploadFileProps, UploadFileResult, DownloadConfig } from "@firecms/core";

export function useSecureStorageSource(
  getAuthToken: () => Promise<string>
): StorageSource {

  async function authenticatedFetch(url: string, options: RequestInit = {}) {
    const token = await getAuthToken();
    return fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` }
    });
  }

  return {
    async uploadFile({ file, fileName, path }: UploadFileProps): Promise<UploadFileResult> {
      const usedFileName = fileName ?? file.name;
      const destinationPath = `${path}/${usedFileName}`;

      // 1. Obtener una URL pre-firmada de subida desde tu servidor
      const res = await authenticatedFetch("/api/storage/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: destinationPath,
          contentType: file.type,
          size: file.size
        })
      });
      const { uploadUrl, storageUrl } = await res.json();

      // 2. Subir directamente al almacenamiento usando la URL pre-firmada
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type }
      });

      return {
        path: destinationPath,
        bucket: "your-bucket",
        storageUrl
      };
    },

    async getDownloadURL(pathOrUrl: string): Promise<DownloadConfig> {
      const res = await authenticatedFetch(
        `/api/storage/download-url?path=${encodeURIComponent(pathOrUrl)}`
      );
      if (!res.ok) return { url: null, fileNotFound: true };
      const data = await res.json();
      return { url: data.url, metadata: data.metadata };
    },

    async getFile(path: string): Promise<File | null> {
      const { url } = await this.getDownloadURL(path);
      if (!url) return null;
      const res = await fetch(url);
      const blob = await res.blob();
      return new File([blob], path.split("/").pop() || "file");
    },

    async deleteFile(path: string): Promise<void> {
      await authenticatedFetch(`/api/storage/files?path=${encodeURIComponent(path)}`, {
        method: "DELETE"
      });
    },

    async list(path: string, options?: { maxResults?: number; pageToken?: string }) {
      const params = new URLSearchParams({ path });
      if (options?.maxResults) params.set("maxResults", String(options.maxResults));
      if (options?.pageToken) params.set("pageToken", options.pageToken);
      const res = await authenticatedFetch(`/api/storage/list?${params}`);
      return res.json();
    }
  };
}
```

### Seguridad del almacenamiento del lado del servidor

Tu endpoint de API de almacenamiento debe aplicar:

| Aspecto | Recomendación |
|---|---|
| **Validación de tipo de archivo** | Lista blanca de tipos MIME permitidos (ej. `image/jpeg`, `application/pdf`). Rechazar ejecutables. |
| **Límites de tamaño de archivo** | Aplicar tamaños máximos de archivo (ej. 10 MB para imágenes, 50 MB para documentos). |
| **Prevención de path traversal** | Sanitizar el parámetro `path`. Rechazar `..`, rutas absolutas o bytes nulos. Nunca permitas que los clientes dicten dónde se almacenan los archivos sin validación. |
| **Expiración de URLs pre-firmadas** | Mantener URLs de subida/descarga de corta duración (5–15 minutos). |
| **Escaneo de virus** | Para contenido subido por usuarios, considera integrar ClamAV o un servicio de escaneo en la nube. |
| **Alcance de acceso** | Cada URL pre-firmada debe otorgar acceso a exactamente un archivo. Usa la identidad del usuario para limitar a qué rutas puede acceder. |

#### Ejemplo de validación de ruta del lado del servidor

```typescript
function validateStoragePath(path: string): boolean {
  if (path.includes("..") || path.startsWith("/")) return false;
  if (path.includes("\0")) return false;

  const allowedPrefixes = ["uploads/", "images/", "documents/"];
  return allowedPrefixes.some(prefix => path.startsWith(prefix));
}

function validateFileType(contentType: string): boolean {
  const allowedTypes = [
    "image/jpeg", "image/png", "image/gif", "image/webp",
    "application/pdf",
    "video/mp4"
  ];
  return allowedTypes.includes(contentType);
}

app.post("/api/storage/upload-url", authenticate, (req, res) => {
  const { path, contentType, size } = req.body;

  if (!validateStoragePath(path)) {
    return res.status(400).json({ error: "Ruta inválida" });
  }
  if (!validateFileType(contentType)) {
    return res.status(400).json({ error: "Tipo de archivo no permitido" });
  }
  if (size > 10 * 1024 * 1024) { // 10 MB
    return res.status(400).json({ error: "Archivo demasiado grande" });
  }

  // Generar y devolver URL pre-firmada...
});
```

---

## 4. Permisos y control de acceso basado en roles

FireCMS tiene un sistema de `Permissions` integrado y un callback `PermissionsBuilder` que puedes usar en cada colección. **Estos son controles a nivel de UI** — determinan qué botones se muestran y qué formularios son editables.

### Permisos del lado del cliente (solo UI)

```typescript
import { buildCollection } from "@firecms/core";

export const productsCollection = buildCollection({
  name: "Products",
  path: "products",
  permissions: ({ authController }) => {
    const role = authController.extra?.role;
    return {
      read:   true,
      create: role === "admin" || role === "editor",
      edit:   role === "admin" || role === "editor",
      delete: role === "admin"
    };
  },
  properties: {
    // ...
  }
});
```

### Replicar permisos en el servidor

Tu API debe aplicar las **mismas reglas exactas**:

```typescript
// permissions.ts — lógica compartida (o replicada del lado del servidor)
type Role = "admin" | "editor" | "viewer";

const collectionPermissions: Record<string, Record<Role, {
  read: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}>> = {
  products: {
    admin:  { read: true, create: true, edit: true, delete: true },
    editor: { read: true, create: true, edit: true, delete: false },
    viewer: { read: true, create: false, edit: false, delete: false },
  },
};

function checkPermission(
  collection: string,
  action: "read" | "create" | "edit" | "delete",
  role: Role
): boolean {
  return collectionPermissions[collection]?.[role]?.[action] ?? false;
}

function requirePermission(action: "read" | "create" | "edit" | "delete") {
  return (req, res, next) => {
    const collection = req.params.path;
    const role = req.user.role;
    if (!checkPermission(collection, action, role)) {
      return res.status(403).json({ error: "Permisos insuficientes" });
    }
    next();
  };
}

app.get("/api/data/:path", authenticate, requirePermission("read"), handler);
app.post("/api/data/:path", authenticate, requirePermission("create"), handler);
app.put("/api/data/:path/:id", authenticate, requirePermission("edit"), handler);
app.delete("/api/data/:path/:id", authenticate, requirePermission("delete"), handler);
```

:::important
Si un usuario puede modificar su propio rol en la base de datos (ej. establecer `role: "admin"` en su propio documento de usuario), tu sistema de permisos está comprometido. **Siempre restringe las escrituras a colecciones de usuario/roles a operaciones exclusivas de administrador.**
:::

---

## 5. Mejores prácticas generales de seguridad

### Seguridad de transporte

- **Siempre usa HTTPS** en producción. Usa TLS 1.2+ con suites de cifrado robustas.
- Establece cabeceras `Strict-Transport-Security` (HSTS).
- Redirige todo el tráfico HTTP a HTTPS.

### Configuración CORS

Configura CORS en tu servidor API para permitir solo tu dominio de FireCMS:

```typescript
import cors from "cors";

app.use(cors({
  origin: "https://tu-panel-admin.ejemplo.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

:::caution
**Nunca uses `origin: "*"`** en producción, especialmente cuando `credentials: true` está activado. Esto permite que cualquier sitio web haga solicitudes autenticadas a tu API.
:::

### Limitación de tasa (Rate Limiting)

Protege tu API de ataques de fuerza bruta y abuso:

```typescript
import rateLimit from "express-rate-limit";

// Límite general de la API
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500
}));

// Límite más estricto para endpoints de autenticación
app.use("/api/auth/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
}));
```

### Política de seguridad de contenido (CSP)

Establece cabeceras CSP para prevenir ataques XSS:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://tu-almacenamiento.ejemplo.com;
  connect-src 'self' https://tu-api.ejemplo.com;
```

### Gestión de secretos

| ❌ No hagas | ✅ Haz |
|---|---|
| Codificar claves API en el código frontend | Usar variables de entorno en el servidor |
| Hacer commit de archivos `.env` en Git | Usar un gestor de secretos (Vault, AWS Secrets Manager, Doppler) |
| Compartir cadenas de conexión de MongoDB con el cliente | Mantener todas las conexiones a base de datos solo del lado del servidor |
| Usar el mismo secreto JWT en todos los entornos | Usar secretos únicos por entorno |

### Seguridad específica de MongoDB

- **Habilita la autenticación** en tu clúster MongoDB. Nunca ejecutes sin autenticación.
- **Usa un usuario de base de datos dedicado** para tu API con los permisos mínimos requeridos.
- **Habilita TLS** para conexiones entre tu API y MongoDB.
- **Control de acceso por red**: restringe qué IPs pueden conectarse a tu clúster MongoDB.
- **Habilita el registro de auditoría** si tu plan de MongoDB lo soporta.

### Seguridad de dependencias

- Ejecuta `npm audit` regularmente y aborda las vulnerabilidades.
- Fija las versiones principales de dependencias en `package.json`.
- Usa `npm audit fix` o herramientas como [Snyk](https://snyk.io) o [Socket](https://socket.dev) para monitoreo continuo.

---

## Lista de verificación resumen

| Área | Requisito | Estado |
|---|---|---|
| **Auth** | Los tokens JWT/sesión son firmados y validados por el servidor | ☐ |
| **Auth** | Los tokens son de corta duración con flujo de renovación | ☐ |
| **Auth** | `signOut` invalida la sesión del lado del servidor | ☐ |
| **Auth** | Los tokens se almacenan en cookies httpOnly (preferido) | ☐ |
| **Datos** | Todo el CRUD pasa por API autenticada | ☐ |
| **Datos** | MongoDB nunca expuesto al navegador | ☐ |
| **Datos** | El servidor valida y sanitiza todas las entradas | ☐ |
| **Datos** | Prevención de inyección NoSQL implementada | ☐ |
| **Datos** | Acceso a colecciones está en lista blanca | ☐ |
| **Datos** | Límites de tamaño de resultados aplicados | ☐ |
| **Almacenamiento** | URLs pre-firmadas usadas para subidas/descargas | ☐ |
| **Almacenamiento** | Tipo y tamaño de archivo validados del lado del servidor | ☐ |
| **Almacenamiento** | Path traversal prevenido | ☐ |
| **Permisos** | Permisos del cliente replican las reglas del servidor | ☐ |
| **Permisos** | Asignación de roles restringida a administradores | ☐ |
| **General** | HTTPS aplicado | ☐ |
| **General** | CORS restringido al dominio del CMS | ☐ |
| **General** | Rate limiting en todos los endpoints de la API | ☐ |
| **General** | Cabeceras CSP configuradas | ☐ |
| **General** | Sin secretos en el código frontend | ☐ |
| **General** | Autenticación y TLS de MongoDB habilitados | ☐ |
| **General** | Dependencias auditadas regularmente | ☐ |
