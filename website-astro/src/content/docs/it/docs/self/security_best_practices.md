---
slug: it/docs/self/security_best_practices
title: Best practice di sicurezza per FireCMS self-hosted
sidebar_label: Best practice di sicurezza
description: Guida completa per proteggere il tuo deployment self-hosted di FireCMS quando utilizzi un backend personalizzato con MongoDB, autenticazione personalizzata e storage di file personalizzato.
---

FireCMS è un'**applicazione React esclusivamente frontend**. Non ha alcun componente server integrato che applichi la sicurezza. Questo significa che **tutta la sicurezza deve essere implementata e applicata nel tuo backend**. I permessi lato client di FireCMS (il callback `permissions` sulle collezioni) controllano la UI/UX — nascondono pulsanti e disabilitano form — ma possono essere aggirati da qualsiasi utente con accesso agli strumenti di sviluppo del browser.

Questa guida copre tutto ciò che devi sapere per proteggere il tuo deployment self-hosted di FireCMS quando utilizzi **MongoDB**, **autenticazione personalizzata** e **storage di file personalizzato** — senza Firebase.

:::caution[Regola d'oro]
**Non fidarti mai del client.** Ogni operazione che legge, scrive o elimina dati deve essere validata e autorizzata sul tuo server. I controlli lato client servono solo per l'esperienza utente.
:::

---

## Panoramica dell'architettura

Un deployment self-hosted sicuro di FireCMS ha la seguente architettura:

```
┌─────────────────┐       HTTPS        ┌──────────────────┐
│  FireCMS React  │ ──────────────────▶ │ Il tuo server API│
│   (Browser)     │ ◀────────────────── │  (Express/Nest)  │
└─────────────────┘                     └──────┬───────────┘
                                               │
                        ┌──────────────────────┤
                        │                      │
                 ┌──────▼──────┐       ┌───────▼──────┐
                 │   MongoDB   │       │   Storage    │
                 │  (Database) │       │  di file     │
                 │             │       │  (S3/Minio)  │
                 └─────────────┘       └──────────────┘
```

Punti chiave:
- Il browser non comunica **mai** direttamente con MongoDB o il tuo backend di storage.
- Il tuo server API è l'unico punto di ingresso che autentica ogni richiesta, autorizza l'azione, valida gli input, e poi interagisce con il database e lo storage.

---

## 1. Implementare un AuthController sicuro

L'interfaccia `AuthController` gestisce lo stato di autenticazione dell'utente nel browser. Quando utilizzi un backend personalizzato, la tua implementazione dovrebbe essere un hook React che comunica con la tua API.

### Riepilogo dell'interfaccia

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

### Best practice

#### Gestione dei token (`getAuthToken`)

La tua implementazione di `getAuthToken` è il fondamento dell'intero modello di sicurezza — ogni richiesta che il tuo `DataSourceDelegate` e `StorageSource` effettuano la chiamerà per allegare le credenziali.

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

  // Al montaggio, verificare se esiste una sessione
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
      // Nessuna sessione valida
    }
  }, []);

  const getAuthToken = useCallback(async (): Promise<string> => {
    if (!accessToken) throw new Error("Non autenticato");
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

**Punti chiave di sicurezza:**

| Aspetto | Raccomandazione |
|---|---|
| **Archiviazione dei token** | Archivia i JWT in cookie `httpOnly`, `Secure`, `SameSite=Strict` quando possibile. Se devi usare token in memoria, non archiviarli mai in `localStorage` o `sessionStorage`. |
| **Scadenza dei token** | Usa token di accesso a breve durata (5–15 minuti) con un flusso di refresh token. |
| **Rinnovo dei token** | Implementa il rinnovo trasparente dei token in `getAuthToken` prima della scadenza. |
| **Invalidazione della sessione** | `signOut` deve chiamare il tuo server per invalidare il refresh token / sessione. Un logout solo lato client non è sicuro. |
| **Caricamento iniziale** | Usa `initialLoading` per verificare silenziosamente se esiste una sessione al montaggio dell'app. |

#### Funzione Authenticator

Il callback `Authenticator` ti permette di controllare **quali utenti autenticati possono accedere a FireCMS**. Usalo per caricare il ruolo dell'utente dal tuo database e allegarlo al controller di autenticazione.

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
    console.error("Errore di autenticazione:", error);
    return false;
  }
};
```

:::tip
Questo callback viene eseguito sul client. **Il tuo server API deve verificare indipendentemente che l'utente richiedente abbia il ruolo dichiarato** ad ogni richiesta. L'`Authenticator` serve solo per il controllo dell'interfaccia.
:::

---

## 2. Proteggere il tuo DataSourceDelegate (MongoDB)

Il `DataSourceDelegate` è l'interfaccia che FireCMS usa per leggere e scrivere dati. Quando è supportato da MongoDB, la tua implementazione deve **fare da proxy per ogni chiamata attraverso il tuo server API autenticato**.

### Non esporre mai MongoDB al browser

Questa è la regola più critica. Non usare il driver MongoDB, l'SDK Realm, né alcuna connessione diretta al database nel browser.

```typescript
// ❌ PERICOLOSO — accesso diretto a MongoDB dal browser
import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb+srv://user:password@cluster...");

// ✅ CORRETTO — proxy attraverso la tua API autenticata
const response = await fetch("/api/data/products", {
  headers: { Authorization: `Bearer ${await authController.getAuthToken()}` }
});
```

### Esempio: DataSourceDelegate sicuro

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
      throw new Error("Non autorizzato");
    }
    if (!res.ok) {
      throw new Error(`Errore API: ${res.status}`);
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

### Checklist di sicurezza lato server

Il tuo server API (es. Express, Fastify, NestJS) deve applicare quanto segue ad **ogni** richiesta:

#### Autenticazione

```typescript
import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token mancante" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token non valido" });
  }
}
```

#### Autorizzazione

```typescript
function authorize(requiredRole: string) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non autenticato" });

    if (user.role !== "admin" && user.role !== requiredRole) {
      return res.status(403).json({ error: "Permessi insufficienti" });
    }
    next();
  };
}

app.delete("/api/data/:path/:id", authenticate, authorize("admin"), async (req, res) => {
  // Solo gli amministratori possono eliminare
});
```

#### Validazione degli input e prevenzione dell'iniezione NoSQL

MongoDB è vulnerabile all'iniezione NoSQL quando l'input dell'utente viene passato direttamente agli operatori di query.

```typescript
// ❌ VULNERABILE — l'input dell'utente va direttamente nella query
app.get("/api/data/:collection", async (req, res) => {
  const filter = JSON.parse(req.query.filter);
  const docs = await db.collection(req.params.collection).find(filter).toArray();
  res.json(docs);
});

// ✅ SICURO — sanitizzare e usare whitelist
import mongo from "mongo-sanitize";

app.get("/api/data/:collection", authenticate, async (req, res) => {
  // 1. Whitelist delle collezioni consentite
  const allowedCollections = ["products", "orders", "categories"];
  if (!allowedCollections.includes(req.params.collection)) {
    return res.status(400).json({ error: "Collezione non valida" });
  }

  // 2. Sanitizzare il filtro per rimuovere gli operatori MongoDB
  let filter = {};
  if (req.query.filter) {
    filter = mongo.sanitize(JSON.parse(req.query.filter));
  }

  // 3. Applicare limiti
  const limit = Math.min(parseInt(req.query.limit) || 25, 100);

  const docs = await db
    .collection(req.params.collection)
    .find(filter)
    .limit(limit)
    .toArray();

  res.json(docs);
});
```

**Validazioni chiave:**

| Controllo | Perché |
|---|---|
| **Whitelist delle collezioni** | Prevenire l'accesso a collezioni di sistema (`admin`, `local`) o interne |
| **Sanitizzare gli operatori di filtro** | Bloccare `$where`, `$gt`, `$regex` e altri operatori iniettabili |
| **Limitare la dimensione dei risultati** | Prevenire denial-of-service tramite query senza limiti |
| **Validare i campi `orderBy`** | Consentire l'ordinamento solo su campi indicizzati/conosciuti |
| **Validare il formato `entityId`** | Assicurarsi che gli ID corrispondano al formato atteso (es. UUID o ObjectId) |
| **Validare i `values` al salvataggio** | Eseguire la validazione dello schema (es. Zod, Joi) sul server prima della scrittura |

---

## 3. Proteggere il tuo StorageSource

L'interfaccia `StorageSource` gestisce l'upload e il download di file. Quando utilizzi storage personalizzato (S3, MinIO, GCS, o un filesystem locale), il principio chiave è: **non esporre mai le credenziali di storage al browser**.

### Riepilogo dell'interfaccia

```typescript
interface StorageSource {
  uploadFile: (props: UploadFileProps) => Promise<UploadFileResult>;
  getDownloadURL: (pathOrUrl: string, bucket?: string) => Promise<DownloadConfig>;
  getFile: (path: string, bucket?: string) => Promise<File | null>;
  deleteFile: (path: string, bucket?: string) => Promise<void>;
  list: (path: string, options?: { ... }) => Promise<StorageListResult>;
}
```

### Usare URL pre-firmati per gli upload

Invece di passare le credenziali S3/GCS al browser, fai generare al tuo server URL pre-firmati a breve durata:

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

### Sicurezza dello storage lato server

Il tuo endpoint API di storage deve applicare:

| Aspetto | Raccomandazione |
|---|---|
| **Validazione del tipo di file** | Whitelist dei tipi MIME consentiti (es. `image/jpeg`, `application/pdf`). Rifiutare gli eseguibili. |
| **Limiti di dimensione file** | Applicare dimensioni massime (es. 10 MB per immagini, 50 MB per documenti). |
| **Prevenzione path traversal** | Sanitizzare il parametro `path`. Rifiutare `..`, percorsi assoluti o byte nulli. |
| **Scadenza URL pre-firmati** | Mantenere gli URL di upload/download a breve durata (5–15 minuti). |
| **Scansione antivirus** | Per contenuti caricati dagli utenti, considera l'integrazione di ClamAV o un servizio di scansione cloud. |
| **Ambito di accesso** | Ogni URL pre-firmato deve concedere accesso a esattamente un file. |

#### Esempio di validazione del percorso lato server

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
    return res.status(400).json({ error: "Percorso non valido" });
  }
  if (!validateFileType(contentType)) {
    return res.status(400).json({ error: "Tipo di file non consentito" });
  }
  if (size > 10 * 1024 * 1024) {
    return res.status(400).json({ error: "File troppo grande" });
  }

  // Generare e restituire URL pre-firmato...
});
```

---

## 4. Permessi e controllo d'accesso basato sui ruoli

FireCMS ha un sistema di `Permissions` integrato e un callback `PermissionsBuilder` che puoi usare su ogni collezione. **Questi sono controlli a livello di UI** — determinano quali pulsanti vengono mostrati e quali form sono modificabili.

### Permessi lato client (solo UI)

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

### Replicare i permessi sul server

La tua API deve applicare le **stesse identiche regole**:

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
      return res.status(403).json({ error: "Permessi insufficienti" });
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
Se un utente può modificare il proprio ruolo nel database (es. impostare `role: "admin"` sul proprio documento utente), il tuo sistema di permessi è compromesso. **Limita sempre le scritture alle collezioni utente/ruoli solo alle operazioni di amministratore.**
:::

---

## 5. Best practice generali di sicurezza

### Sicurezza del trasporto

- **Usa sempre HTTPS** in produzione. Usa TLS 1.2+ con suite di cifratura robuste.
- Imposta gli header `Strict-Transport-Security` (HSTS).
- Reindirizza tutto il traffico HTTP verso HTTPS.

### Configurazione CORS

Configura CORS sul tuo server API per consentire solo il tuo dominio FireCMS:

```typescript
import cors from "cors";

app.use(cors({
  origin: "https://il-tuo-pannello-admin.esempio.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

:::caution
**Non usare mai `origin: "*"`** in produzione, specialmente quando `credentials: true` è impostato. Questo permette a qualsiasi sito web di effettuare richieste autenticate alla tua API.
:::

### Rate Limiting

Proteggi la tua API da attacchi brute-force e abusi:

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

Imposta gli header CSP per prevenire attacchi XSS:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://il-tuo-storage.esempio.com;
  connect-src 'self' https://la-tua-api.esempio.com;
```

### Gestione dei segreti

| ❌ Non fare | ✅ Fai |
|---|---|
| Codificare le chiavi API nel codice frontend | Usare variabili d'ambiente sul server |
| Fare commit di file `.env` in Git | Usare un gestore di segreti (Vault, AWS Secrets Manager, Doppler) |
| Condividere le stringhe di connessione MongoDB con il client | Mantenere tutte le connessioni al database solo lato server |
| Usare lo stesso segreto JWT in tutti gli ambienti | Usare segreti unici per ambiente |

### Sicurezza specifica di MongoDB

- **Abilita l'autenticazione** sul tuo cluster MongoDB. Non eseguirlo mai senza autenticazione.
- **Usa un utente database dedicato** per la tua API con i permessi minimi necessari.
- **Abilita TLS** per le connessioni tra la tua API e MongoDB.
- **Controllo d'accesso di rete**: limita quali IP possono connettersi al tuo cluster MongoDB.
- **Abilita il logging di audit** se il tuo piano MongoDB lo supporta.

### Sicurezza delle dipendenze

- Esegui `npm audit` regolarmente e risolvi le vulnerabilità.
- Fissa le versioni principali delle dipendenze in `package.json`.
- Usa `npm audit fix` o strumenti come [Snyk](https://snyk.io) o [Socket](https://socket.dev) per il monitoraggio continuo.

---

## Checklist riepilogativa

| Area | Requisito | Stato |
|---|---|---|
| **Auth** | I token JWT/sessione sono firmati e validati dal server | ☐ |
| **Auth** | I token sono a breve durata con flusso di rinnovo | ☐ |
| **Auth** | `signOut` invalida la sessione lato server | ☐ |
| **Auth** | I token sono archiviati in cookie httpOnly (preferito) | ☐ |
| **Dati** | Tutto il CRUD passa attraverso API autenticata | ☐ |
| **Dati** | MongoDB mai esposto al browser | ☐ |
| **Dati** | Il server valida e sanitizza tutti gli input | ☐ |
| **Dati** | Prevenzione dell'iniezione NoSQL implementata | ☐ |
| **Dati** | L'accesso alle collezioni è in whitelist | ☐ |
| **Dati** | Limiti di dimensione dei risultati applicati | ☐ |
| **Storage** | URL pre-firmati usati per upload/download | ☐ |
| **Storage** | Tipo e dimensione file validati lato server | ☐ |
| **Storage** | Path traversal prevenuto | ☐ |
| **Permessi** | I permessi lato client replicano le regole lato server | ☐ |
| **Permessi** | L'assegnazione dei ruoli è ristretta agli amministratori | ☐ |
| **Generale** | HTTPS applicato | ☐ |
| **Generale** | CORS limitato al dominio del CMS | ☐ |
| **Generale** | Rate limiting su tutti gli endpoint dell'API | ☐ |
| **Generale** | Header CSP configurati | ☐ |
| **Generale** | Nessun segreto nel codice frontend | ☐ |
| **Generale** | Auth e TLS MongoDB abilitati | ☐ |
| **Generale** | Dipendenze auditate regolarmente | ☐ |
