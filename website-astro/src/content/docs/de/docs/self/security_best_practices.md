---
slug: de/docs/self/security_best_practices
title: Sicherheits-Best-Practices für selbstgehostetes FireCMS
sidebar_label: Sicherheits-Best-Practices
description: Ein umfassender Leitfaden zur Absicherung Ihres selbstgehosteten FireCMS-Deployments bei Verwendung eines eigenen Backends mit MongoDB, eigener Authentifizierung und eigenem Dateispeicher.
---

FireCMS ist eine **reine Frontend-React-Anwendung**. Es gibt keine integrierte Serverkomponente, die Sicherheit durchsetzt. Das bedeutet, dass **alle Sicherheitsmaßnahmen in Ihrem Backend implementiert und durchgesetzt werden müssen**. Die clientseitigen Berechtigungen von FireCMS (der `permissions`-Callback bei Sammlungen) steuern die UI/UX — sie blenden Schaltflächen aus und deaktivieren Formulare — können aber von jedem Benutzer mit Zugriff auf die Browser-Entwicklertools umgangen werden.

Dieser Leitfaden deckt alles ab, was Sie wissen müssen, um Ihr selbstgehostetes FireCMS-Deployment abzusichern, wenn Sie **MongoDB**, **eigene Authentifizierung** und **eigenen Dateispeicher** verwenden — ohne Firebase.

:::caution[Goldene Regel]
**Vertrauen Sie niemals dem Client.** Jede Operation, die Daten liest, schreibt oder löscht, muss auf Ihrem Server validiert und autorisiert werden. Clientseitige Prüfungen dienen nur der Benutzererfahrung.
:::

---

## Architekturübersicht

Ein sicheres selbstgehostetes FireCMS-Deployment hat die folgende Architektur:

```
┌─────────────────┐       HTTPS        ┌──────────────────┐
│  FireCMS React  │ ──────────────────▶ │  Ihr API-Server  │
│   (Browser)     │ ◀────────────────── │  (Express/Nest)  │
└─────────────────┘                     └──────┬───────────┘
                                               │
                        ┌──────────────────────┤
                        │                      │
                 ┌──────▼──────┐       ┌───────▼──────┐
                 │   MongoDB   │       │ Dateispeicher│
                 │  (Datenbank)│       │  (S3/Minio)  │
                 └─────────────┘       └──────────────┘
```

Kernpunkte:
- Der Browser kommuniziert **niemals** direkt mit MongoDB oder Ihrem Speicher-Backend.
- Ihr API-Server ist der einzige Zugangspunkt, der jede Anfrage authentifiziert, die Aktion autorisiert, Eingaben validiert und dann mit der Datenbank und dem Speicher interagiert.

---

## 1. Einen sicheren AuthController implementieren

Das `AuthController`-Interface verwaltet den Authentifizierungszustand des Benutzers im Browser. Bei Verwendung eines eigenen Backends sollte Ihre Implementierung ein React-Hook sein, der mit Ihrer eigenen API kommuniziert.

### Interface-Übersicht

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

### Best Practices

#### Token-Verwaltung (`getAuthToken`)

Ihre `getAuthToken`-Implementierung ist das Fundament des gesamten Sicherheitsmodells — jede Anfrage, die Ihr `DataSourceDelegate` und `StorageSource` stellen, wird sie aufrufen, um Anmeldeinformationen anzuhängen.

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

  // Beim Laden vorhandene Sitzung prüfen
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
      // Keine gültige Sitzung
    }
  }, []);

  const getAuthToken = useCallback(async (): Promise<string> => {
    if (!accessToken) throw new Error("Nicht authentifiziert");
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

**Wichtige Sicherheitspunkte:**

| Bereich | Empfehlung |
|---|---|
| **Token-Speicherung** | Speichern Sie JWTs nach Möglichkeit in `httpOnly`-, `Secure`-, `SameSite=Strict`-Cookies. Wenn Sie In-Memory-Tokens verwenden müssen, speichern Sie diese niemals in `localStorage` oder `sessionStorage`. |
| **Token-Ablauf** | Verwenden Sie kurzlebige Access-Tokens (5–15 Minuten) mit einem Refresh-Token-Flow. |
| **Token-Erneuerung** | Implementieren Sie transparente Token-Erneuerung in `getAuthToken` vor Ablauf. |
| **Sitzungsinvalidierung** | `signOut` muss Ihren Server aufrufen, um den Refresh-Token / die Sitzung zu invalidieren. Ein nur clientseitiger Logout ist nicht sicher. |
| **Initialer Ladevorgang** | Verwenden Sie `initialLoading`, um beim App-Start stillschweigend nach einer vorhandenen Sitzung zu prüfen. |

#### Authenticator-Funktion

Der `Authenticator`-Callback ermöglicht es Ihnen zu steuern, **welche authentifizierten Benutzer auf FireCMS zugreifen können**. Verwenden Sie ihn, um die Rolle des Benutzers aus Ihrer Datenbank zu laden und an den Auth-Controller anzuhängen.

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
    console.error("Authentifizierungsfehler:", error);
    return false;
  }
};
```

:::tip
Dieser Callback wird auf dem Client ausgeführt. **Ihr API-Server muss bei jeder Anfrage unabhängig überprüfen, dass der anfragende Benutzer die beanspruchte Rolle hat.** Der `Authenticator` dient nur der UI-Steuerung.
:::

---

## 2. Ihren DataSourceDelegate (MongoDB) absichern

Der `DataSourceDelegate` ist das Interface, das FireCMS zum Lesen und Schreiben von Daten verwendet. Bei MongoDB-Unterstützung sollte Ihre Implementierung **jeden Aufruf über Ihren authentifizierten API-Server proxen**.

### MongoDB niemals dem Browser aussetzen

Dies ist die wichtigste Regel. Verwenden Sie keinen MongoDB-Treiber, Realm-SDK oder eine direkte Datenbankverbindung im Browser.

```typescript
// ❌ GEFÄHRLICH — direkter MongoDB-Zugriff vom Browser
import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb+srv://user:password@cluster...");

// ✅ KORREKT — über Ihre authentifizierte API proxen
const response = await fetch("/api/data/products", {
  headers: { Authorization: `Bearer ${await authController.getAuthToken()}` }
});
```

### Beispiel: Sicherer DataSourceDelegate

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
      throw new Error("Nicht autorisiert");
    }
    if (!res.ok) {
      throw new Error(`API-Fehler: ${res.status}`);
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

### Sicherheits-Checkliste für den Server

Ihr API-Server (z.B. Express, Fastify, NestJS) muss bei **jeder** Anfrage Folgendes durchsetzen:

#### Authentifizierung

```typescript
import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token fehlt" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Ungültiger Token" });
  }
}
```

#### Autorisierung

```typescript
function authorize(requiredRole: string) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Nicht authentifiziert" });

    if (user.role !== "admin" && user.role !== requiredRole) {
      return res.status(403).json({ error: "Unzureichende Berechtigungen" });
    }
    next();
  };
}

app.delete("/api/data/:path/:id", authenticate, authorize("admin"), async (req, res) => {
  // Nur Administratoren können löschen
});
```

#### Eingabevalidierung und NoSQL-Injection-Prävention

MongoDB ist anfällig für NoSQL-Injection, wenn Benutzereingaben direkt an Abfrageoperatoren übergeben werden.

```typescript
// ❌ ANFÄLLIG — Benutzereingabe geht direkt in die Abfrage
app.get("/api/data/:collection", async (req, res) => {
  const filter = JSON.parse(req.query.filter);
  const docs = await db.collection(req.params.collection).find(filter).toArray();
  res.json(docs);
});

// ✅ SICHER — bereinigen und Whitelist verwenden
import mongo from "mongo-sanitize";

app.get("/api/data/:collection", authenticate, async (req, res) => {
  // 1. Erlaubte Sammlungen whitelisten
  const allowedCollections = ["products", "orders", "categories"];
  if (!allowedCollections.includes(req.params.collection)) {
    return res.status(400).json({ error: "Ungültige Sammlung" });
  }

  // 2. Filter bereinigen, um MongoDB-Operatoren zu entfernen
  let filter = {};
  if (req.query.filter) {
    filter = mongo.sanitize(JSON.parse(req.query.filter));
  }

  // 3. Limits durchsetzen
  const limit = Math.min(parseInt(req.query.limit) || 25, 100);

  const docs = await db
    .collection(req.params.collection)
    .find(filter)
    .limit(limit)
    .toArray();

  res.json(docs);
});
```

**Wichtige Validierungen:**

| Prüfung | Warum |
|---|---|
| **Sammlungen whitelisten** | Zugriff auf Systemsammlungen (`admin`, `local`) oder interne Sammlungen verhindern |
| **Filteroperatoren bereinigen** | `$where`, `$gt`, `$regex` und andere injizierbare Operatoren blockieren |
| **Ergebnisgröße begrenzen** | Denial-of-Service durch unbegrenzte Abfragen verhindern |
| **`orderBy`-Felder validieren** | Nur Sortierung nach indizierten/bekannten Feldern erlauben |
| **`entityId`-Format validieren** | Sicherstellen, dass IDs dem erwarteten Format entsprechen (z.B. UUID oder ObjectId) |
| **`values` beim Speichern validieren** | Schema-Validierung (z.B. Zod, Joi) auf dem Server vor dem Schreiben ausführen |

---

## 3. Ihren StorageSource absichern

Das `StorageSource`-Interface verwaltet Datei-Uploads und -Downloads. Bei Verwendung von benutzerdefiniertem Speicher (S3, MinIO, GCS oder lokales Dateisystem) lautet das Schlüsselprinzip: **Setzen Sie niemals Speicher-Anmeldeinformationen dem Browser aus**.

### Interface-Übersicht

```typescript
interface StorageSource {
  uploadFile: (props: UploadFileProps) => Promise<UploadFileResult>;
  getDownloadURL: (pathOrUrl: string, bucket?: string) => Promise<DownloadConfig>;
  getFile: (path: string, bucket?: string) => Promise<File | null>;
  deleteFile: (path: string, bucket?: string) => Promise<void>;
  list: (path: string, options?: { ... }) => Promise<StorageListResult>;
}
```

### Vorsignierte URLs für Uploads verwenden

Anstatt S3/GCS-Anmeldeinformationen an den Browser zu übergeben, lassen Sie Ihren Server kurzlebige vorsignierte URLs generieren:

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

### Serverseitige Speichersicherheit

Ihr Speicher-API-Endpunkt muss durchsetzen:

| Bereich | Empfehlung |
|---|---|
| **Dateityp-Validierung** | Whitelist erlaubter MIME-Typen (z.B. `image/jpeg`, `application/pdf`). Ausführbare Dateien ablehnen. |
| **Dateigrößen-Limits** | Maximale Dateigrößen durchsetzen (z.B. 10 MB für Bilder, 50 MB für Dokumente). |
| **Path-Traversal-Prävention** | Den `path`-Parameter bereinigen. `..`, absolute Pfade oder Null-Bytes ablehnen. |
| **Ablauf vorsignierter URLs** | Upload/Download-URLs kurzlebig halten (5–15 Minuten). |
| **Virenscanning** | Für benutzerhochgeladene Inhalte ClamAV oder einen cloudbasierten Scandienst in Betracht ziehen. |
| **Zugriffsbereich** | Jede vorsignierte URL sollte Zugriff auf genau eine Datei gewähren. |

#### Serverseitiges Pfad-Validierungsbeispiel

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
    return res.status(400).json({ error: "Ungültiger Pfad" });
  }
  if (!validateFileType(contentType)) {
    return res.status(400).json({ error: "Dateityp nicht erlaubt" });
  }
  if (size > 10 * 1024 * 1024) {
    return res.status(400).json({ error: "Datei zu groß" });
  }

  // Vorsignierte URL generieren und zurückgeben...
});
```

---

## 4. Berechtigungen und rollenbasierte Zugriffskontrolle

FireCMS hat ein integriertes `Permissions`-System und einen `PermissionsBuilder`-Callback, den Sie bei jeder Sammlung verwenden können. **Dies sind Steuerungen auf UI-Ebene** — sie bestimmen, welche Schaltflächen angezeigt werden und welche Formulare bearbeitbar sind.

### Clientseitige Berechtigungen (nur UI)

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

### Berechtigungen auf dem Server spiegeln

Ihre API muss die **exakt gleichen Regeln** durchsetzen:

```typescript
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
      return res.status(403).json({ error: "Unzureichende Berechtigungen" });
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
Wenn ein Benutzer seine eigene Rolle in der Datenbank ändern kann (z.B. `role: "admin"` auf seinem eigenen Benutzerdokument setzen), ist Ihr Berechtigungssystem kompromittiert. **Beschränken Sie Schreibvorgänge auf Benutzer-/Rollensammlungen immer auf Administratoroperationen.**
:::

---

## 5. Allgemeine Sicherheits-Best-Practices

### Transportsicherheit

- **Verwenden Sie immer HTTPS** in der Produktion. Verwenden Sie TLS 1.2+ mit starken Cipher-Suites.
- Setzen Sie `Strict-Transport-Security`-Header (HSTS).
- Leiten Sie allen HTTP-Verkehr auf HTTPS um.

### CORS-Konfiguration

Konfigurieren Sie CORS auf Ihrem API-Server, um nur Ihre FireCMS-Domäne zuzulassen:

```typescript
import cors from "cors";

app.use(cors({
  origin: "https://ihr-admin-panel.beispiel.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

:::caution
**Verwenden Sie niemals `origin: "*"`** in der Produktion, insbesondere wenn `credentials: true` gesetzt ist. Dies ermöglicht es jeder Website, authentifizierte Anfragen an Ihre API zu senden.
:::

### Rate Limiting

Schützen Sie Ihre API vor Brute-Force-Angriffen und Missbrauch:

```typescript
import rateLimit from "express-rate-limit";

app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500
}));

app.use("/api/auth/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
}));
```

### Content Security Policy

Setzen Sie CSP-Header, um XSS-Angriffe zu verhindern:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://ihr-speicher.beispiel.com;
  connect-src 'self' https://ihre-api.beispiel.com;
```

### Geheimnisverwaltung

| ❌ Nicht tun | ✅ Tun |
|---|---|
| API-Schlüssel im Frontend-Code hardcoden | Umgebungsvariablen auf dem Server verwenden |
| `.env`-Dateien in Git committen | Einen Secrets Manager verwenden (Vault, AWS Secrets Manager, Doppler) |
| MongoDB-Verbindungsstrings mit dem Client teilen | Alle Datenbankverbindungen nur serverseitig halten |
| Das gleiche JWT-Secret in allen Umgebungen verwenden | Einzigartige Secrets pro Umgebung verwenden |

### MongoDB-spezifische Sicherheit

- **Aktivieren Sie die Authentifizierung** auf Ihrem MongoDB-Cluster. Betreiben Sie ihn niemals ohne Authentifizierung.
- **Verwenden Sie einen dedizierten Datenbankbenutzer** für Ihre API mit den minimal erforderlichen Berechtigungen.
- **Aktivieren Sie TLS** für Verbindungen zwischen Ihrer API und MongoDB.
- **Netzwerkzugriffskontrolle**: Beschränken Sie, welche IPs sich mit Ihrem MongoDB-Cluster verbinden können.
- **Aktivieren Sie Audit-Logging**, wenn Ihr MongoDB-Plan dies unterstützt.

### Abhängigkeitssicherheit

- Führen Sie regelmäßig `npm audit` aus und beheben Sie Schwachstellen.
- Pinnen Sie Hauptversionen von Abhängigkeiten in `package.json`.
- Verwenden Sie `npm audit fix` oder Tools wie [Snyk](https://snyk.io) oder [Socket](https://socket.dev) für kontinuierliche Überwachung.

---

## Zusammenfassende Checkliste

| Bereich | Anforderung | Status |
|---|---|---|
| **Auth** | JWT/Sitzungstoken werden serverseitig signiert und validiert | ☐ |
| **Auth** | Token sind kurzlebig mit Erneuerungsflow | ☐ |
| **Auth** | `signOut` invalidiert die serverseitige Sitzung | ☐ |
| **Auth** | Token in httpOnly-Cookies gespeichert (bevorzugt) | ☐ |
| **Daten** | Alle CRUD-Operationen gehen über authentifizierte API | ☐ |
| **Daten** | MongoDB niemals dem Browser ausgesetzt | ☐ |
| **Daten** | Server validiert und bereinigt alle Eingaben | ☐ |
| **Daten** | NoSQL-Injection-Prävention vorhanden | ☐ |
| **Daten** | Sammlungszugriff ist gewhitelistet | ☐ |
| **Daten** | Ergebnisgrößen-Limits durchgesetzt | ☐ |
| **Speicher** | Vorsignierte URLs für Uploads/Downloads verwendet | ☐ |
| **Speicher** | Dateityp und -größe serverseitig validiert | ☐ |
| **Speicher** | Path-Traversal verhindert | ☐ |
| **Berechtigungen** | Clientseitige Berechtigungen spiegeln serverseitige Regeln | ☐ |
| **Berechtigungen** | Rollenzuweisung auf Administratoren beschränkt | ☐ |
| **Allgemein** | HTTPS durchgesetzt | ☐ |
| **Allgemein** | CORS auf CMS-Domäne beschränkt | ☐ |
| **Allgemein** | Rate Limiting auf allen API-Endpunkten | ☐ |
| **Allgemein** | CSP-Header konfiguriert | ☐ |
| **Allgemein** | Keine Geheimnisse im Frontend-Code | ☐ |
| **Allgemein** | MongoDB-Auth und TLS aktiviert | ☐ |
| **Allgemein** | Abhängigkeiten regelmäßig geprüft | ☐ |
