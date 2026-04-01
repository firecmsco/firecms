---
slug: fr/docs/self/security_best_practices
title: Bonnes pratiques de sécurité pour FireCMS auto-hébergé
sidebar_label: Bonnes pratiques de sécurité
description: Guide complet pour sécuriser votre déploiement auto-hébergé de FireCMS lors de l'utilisation d'un backend personnalisé avec MongoDB, authentification personnalisée et stockage de fichiers personnalisé.
---

FireCMS est une **application React exclusivement frontend**. Elle ne dispose d'aucun composant serveur intégré qui applique la sécurité. Cela signifie que **toute la sécurité doit être implémentée et appliquée sur votre backend**. Les permissions côté client de FireCMS (le callback `permissions` sur les collections) contrôlent l'UI/UX — elles masquent les boutons et désactivent les formulaires — mais elles peuvent être contournées par tout utilisateur ayant accès aux outils de développement du navigateur.

Ce guide couvre tout ce que vous devez savoir pour sécuriser votre déploiement auto-hébergé de FireCMS lors de l'utilisation de **MongoDB**, d'une **authentification personnalisée** et d'un **stockage de fichiers personnalisé** — sans Firebase.

:::caution[Règle d'or]
**Ne faites jamais confiance au client.** Chaque opération qui lit, écrit ou supprime des données doit être validée et autorisée sur votre serveur. Les vérifications côté client ne servent qu'à l'expérience utilisateur.
:::

---

## Vue d'ensemble de l'architecture

Un déploiement auto-hébergé sécurisé de FireCMS a l'architecture suivante :

```
┌─────────────────┐       HTTPS        ┌──────────────────┐
│  FireCMS React  │ ──────────────────▶ │ Votre serveur API│
│   (Navigateur)  │ ◀────────────────── │  (Express/Nest)  │
└─────────────────┘                     └──────┬───────────┘
                                               │
                        ┌──────────────────────┤
                        │                      │
                 ┌──────▼──────┐       ┌───────▼──────┐
                 │   MongoDB   │       │  Stockage    │
                 │ (Base de    │       │  de fichiers │
                 │  données)   │       │  (S3/Minio)  │
                 └─────────────┘       └──────────────┘
```

Points clés :
- Le navigateur ne communique **jamais** directement avec MongoDB ou votre backend de stockage.
- Votre serveur API est le point d'entrée unique qui authentifie chaque requête, autorise l'action, valide les entrées, puis interagit avec la base de données et le stockage.

---

## 1. Implémenter un AuthController sécurisé

L'interface `AuthController` gère l'état d'authentification de l'utilisateur dans le navigateur. Lors de l'utilisation d'un backend personnalisé, votre implémentation doit être un hook React qui communique avec votre propre API.

### Récapitulatif de l'interface

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

### Bonnes pratiques

#### Gestion des tokens (`getAuthToken`)

Votre implémentation de `getAuthToken` est la pierre angulaire de tout le modèle de sécurité — chaque requête que votre `DataSourceDelegate` et `StorageSource` effectuent l'appellera pour joindre les identifiants.

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

  // Au montage, vérifier s'il existe une session
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
      // Pas de session valide
    }
  }, []);

  const getAuthToken = useCallback(async (): Promise<string> => {
    if (!accessToken) throw new Error("Non authentifié");
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

**Points de sécurité clés :**

| Aspect | Recommandation |
|---|---|
| **Stockage des tokens** | Stockez les JWT dans des cookies `httpOnly`, `Secure`, `SameSite=Strict` quand c'est possible. Si vous devez utiliser des tokens en mémoire, ne les stockez jamais dans `localStorage` ou `sessionStorage`. |
| **Expiration des tokens** | Utilisez des tokens d'accès à courte durée de vie (5–15 minutes) avec un flux de refresh token. |
| **Renouvellement des tokens** | Implémentez le renouvellement transparent des tokens dans `getAuthToken` avant expiration. |
| **Invalidation de session** | `signOut` doit appeler votre serveur pour invalider le refresh token / la session. Une déconnexion uniquement côté client n'est pas sécurisée. |
| **Chargement initial** | Utilisez `initialLoading` pour vérifier silencieusement si une session existe au montage de l'app. |

#### Fonction Authenticator

Le callback `Authenticator` vous permet de contrôler **quels utilisateurs authentifiés peuvent accéder à FireCMS**. Utilisez-le pour charger le rôle de l'utilisateur depuis votre base de données et l'attacher au contrôleur d'authentification.

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
    console.error("Erreur d'authentification :", error);
    return false;
  }
};
```

:::tip
Ce callback s'exécute sur le client. **Votre serveur API doit vérifier indépendamment que l'utilisateur demandeur possède le rôle revendiqué** à chaque requête. L'`Authenticator` ne sert qu'au contrôle de l'interface.
:::

---

## 2. Sécuriser votre DataSourceDelegate (MongoDB)

Le `DataSourceDelegate` est l'interface que FireCMS utilise pour lire et écrire des données. Lorsqu'il est adossé à MongoDB, votre implémentation doit **proxifier chaque appel via votre serveur API authentifié**.

### Ne jamais exposer MongoDB au navigateur

C'est la règle la plus critique. N'utilisez pas le driver MongoDB, le SDK Realm, ni aucune connexion directe à la base de données dans le navigateur.

```typescript
// ❌ DANGEREUX — accès direct à MongoDB depuis le navigateur
import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb+srv://user:password@cluster...");

// ✅ CORRECT — proxifier via votre API authentifiée
const response = await fetch("/api/data/products", {
  headers: { Authorization: `Bearer ${await authController.getAuthToken()}` }
});
```

### Exemple : DataSourceDelegate sécurisé

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
      throw new Error("Non autorisé");
    }
    if (!res.ok) {
      throw new Error(`Erreur API : ${res.status}`);
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

### Liste de vérification de sécurité côté serveur

Votre serveur API (ex. Express, Fastify, NestJS) doit appliquer ce qui suit à **chaque** requête :

#### Authentification

```typescript
import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token manquant" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide" });
  }
}
```

#### Autorisation

```typescript
function authorize(requiredRole: string) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Non authentifié" });

    if (user.role !== "admin" && user.role !== requiredRole) {
      return res.status(403).json({ error: "Permissions insuffisantes" });
    }
    next();
  };
}

app.delete("/api/data/:path/:id", authenticate, authorize("admin"), async (req, res) => {
  // Seuls les administrateurs peuvent supprimer
});
```

#### Validation des entrées et prévention de l'injection NoSQL

MongoDB est vulnérable à l'injection NoSQL lorsque les entrées utilisateur sont passées directement aux opérateurs de requête.

```typescript
// ❌ VULNÉRABLE — l'entrée utilisateur va directement dans la requête
app.get("/api/data/:collection", async (req, res) => {
  const filter = JSON.parse(req.query.filter);
  const docs = await db.collection(req.params.collection).find(filter).toArray();
  res.json(docs);
});

// ✅ SÉCURISÉ — assainir et utiliser une liste blanche
import mongo from "mongo-sanitize";

app.get("/api/data/:collection", authenticate, async (req, res) => {
  // 1. Liste blanche des collections autorisées
  const allowedCollections = ["products", "orders", "categories"];
  if (!allowedCollections.includes(req.params.collection)) {
    return res.status(400).json({ error: "Collection invalide" });
  }

  // 2. Assainir le filtre pour supprimer les opérateurs MongoDB
  let filter = {};
  if (req.query.filter) {
    filter = mongo.sanitize(JSON.parse(req.query.filter));
  }

  // 3. Appliquer des limites
  const limit = Math.min(parseInt(req.query.limit) || 25, 100);

  const docs = await db
    .collection(req.params.collection)
    .find(filter)
    .limit(limit)
    .toArray();

  res.json(docs);
});
```

**Validations clés :**

| Vérification | Pourquoi |
|---|---|
| **Liste blanche des collections** | Empêcher l'accès aux collections système (`admin`, `local`) ou internes |
| **Assainir les opérateurs de filtre** | Bloquer `$where`, `$gt`, `$regex` et autres opérateurs injectables |
| **Limiter la taille des résultats** | Prévenir le déni de service via des requêtes sans limite |
| **Valider les champs `orderBy`** | N'autoriser le tri que sur des champs indexés/connus |
| **Valider le format `entityId`** | S'assurer que les IDs correspondent au format attendu (ex. UUID ou ObjectId) |
| **Valider les `values` à la sauvegarde** | Exécuter la validation de schéma (ex. Zod, Joi) sur le serveur avant l'écriture |

---

## 3. Sécuriser votre StorageSource

L'interface `StorageSource` gère les téléchargements et téléversements de fichiers. Avec un stockage personnalisé (S3, MinIO, GCS, ou un système de fichiers local), le principe clé est : **ne jamais exposer les identifiants de stockage au navigateur**.

### Récapitulatif de l'interface

```typescript
interface StorageSource {
  uploadFile: (props: UploadFileProps) => Promise<UploadFileResult>;
  getDownloadURL: (pathOrUrl: string, bucket?: string) => Promise<DownloadConfig>;
  getFile: (path: string, bucket?: string) => Promise<File | null>;
  deleteFile: (path: string, bucket?: string) => Promise<void>;
  list: (path: string, options?: { ... }) => Promise<StorageListResult>;
}
```

### Utiliser des URLs pré-signées pour les téléversements

Au lieu de transmettre les identifiants S3/GCS au navigateur, faites générer par votre serveur des URLs pré-signées à courte durée de vie :

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

### Sécurité du stockage côté serveur

Votre endpoint API de stockage doit appliquer :

| Aspect | Recommandation |
|---|---|
| **Validation du type de fichier** | Liste blanche des types MIME autorisés (ex. `image/jpeg`, `application/pdf`). Rejeter les exécutables. |
| **Limites de taille de fichier** | Appliquer des tailles maximales (ex. 10 Mo pour les images, 50 Mo pour les documents). |
| **Prévention de traversée de chemin** | Assainir le paramètre `path`. Rejeter `..`, les chemins absolus ou les octets nuls. |
| **Expiration des URLs pré-signées** | Garder les URLs de téléversement/téléchargement à courte durée de vie (5–15 minutes). |
| **Analyse antivirus** | Pour le contenu téléversé par les utilisateurs, envisagez d'intégrer ClamAV ou un service d'analyse cloud. |
| **Portée d'accès** | Chaque URL pré-signée doit accorder l'accès à exactement un fichier. |

#### Exemple de validation de chemin côté serveur

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
    return res.status(400).json({ error: "Chemin invalide" });
  }
  if (!validateFileType(contentType)) {
    return res.status(400).json({ error: "Type de fichier non autorisé" });
  }
  if (size > 10 * 1024 * 1024) {
    return res.status(400).json({ error: "Fichier trop volumineux" });
  }

  // Générer et retourner l'URL pré-signée...
});
```

---

## 4. Permissions et contrôle d'accès basé sur les rôles

FireCMS dispose d'un système de `Permissions` intégré et d'un callback `PermissionsBuilder` que vous pouvez utiliser sur chaque collection. **Ce sont des contrôles au niveau de l'UI** — ils déterminent quels boutons sont affichés et quels formulaires sont modifiables.

### Permissions côté client (UI uniquement)

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

### Répliquer les permissions côté serveur

Votre API doit appliquer les **mêmes règles exactes** :

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
      return res.status(403).json({ error: "Permissions insuffisantes" });
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
Si un utilisateur peut modifier son propre rôle dans la base de données (ex. définir `role: "admin"` sur son propre document utilisateur), votre système de permissions est compromis. **Restreignez toujours les écritures aux collections utilisateur/rôles aux opérations d'administrateur uniquement.**
:::

---

## 5. Bonnes pratiques générales de sécurité

### Sécurité du transport

- **Utilisez toujours HTTPS** en production. Utilisez TLS 1.2+ avec des suites de chiffrement robustes.
- Définissez les en-têtes `Strict-Transport-Security` (HSTS).
- Redirigez tout le trafic HTTP vers HTTPS.

### Configuration CORS

Configurez CORS sur votre serveur API pour n'autoriser que votre domaine FireCMS :

```typescript
import cors from "cors";

app.use(cors({
  origin: "https://votre-panneau-admin.exemple.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

:::caution
**N'utilisez jamais `origin: "*"`** en production, surtout quand `credentials: true` est activé. Cela permet à n'importe quel site web d'effectuer des requêtes authentifiées vers votre API.
:::

### Limitation de débit (Rate Limiting)

Protégez votre API contre les attaques par force brute et les abus :

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

### Politique de sécurité du contenu (CSP)

Définissez des en-têtes CSP pour prévenir les attaques XSS :

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://votre-stockage.exemple.com;
  connect-src 'self' https://votre-api.exemple.com;
```

### Gestion des secrets

| ❌ À ne pas faire | ✅ À faire |
|---|---|
| Coder en dur les clés API dans le code frontend | Utiliser des variables d'environnement sur le serveur |
| Commiter des fichiers `.env` dans Git | Utiliser un gestionnaire de secrets (Vault, AWS Secrets Manager, Doppler) |
| Partager les chaînes de connexion MongoDB avec le client | Garder toutes les connexions à la base de données côté serveur uniquement |
| Utiliser le même secret JWT dans tous les environnements | Utiliser des secrets uniques par environnement |

### Sécurité spécifique à MongoDB

- **Activez l'authentification** sur votre cluster MongoDB. Ne l'exécutez jamais sans authentification.
- **Utilisez un utilisateur de base de données dédié** pour votre API avec les permissions minimales requises.
- **Activez TLS** pour les connexions entre votre API et MongoDB.
- **Contrôle d'accès réseau** : restreignez quelles IPs peuvent se connecter à votre cluster MongoDB.
- **Activez la journalisation d'audit** si votre plan MongoDB le supporte.

### Sécurité des dépendances

- Exécutez `npm audit` régulièrement et corrigez les vulnérabilités.
- Verrouillez les versions majeures des dépendances dans `package.json`.
- Utilisez `npm audit fix` ou des outils comme [Snyk](https://snyk.io) ou [Socket](https://socket.dev) pour une surveillance continue.

---

## Liste de vérification récapitulative

| Domaine | Exigence | Statut |
|---|---|---|
| **Auth** | Les tokens JWT/session sont signés et validés par le serveur | ☐ |
| **Auth** | Les tokens sont à courte durée de vie avec flux de renouvellement | ☐ |
| **Auth** | `signOut` invalide la session côté serveur | ☐ |
| **Auth** | Les tokens sont stockés dans des cookies httpOnly (préféré) | ☐ |
| **Données** | Tout le CRUD passe par une API authentifiée | ☐ |
| **Données** | MongoDB jamais exposé au navigateur | ☐ |
| **Données** | Le serveur valide et assainit toutes les entrées | ☐ |
| **Données** | Prévention de l'injection NoSQL en place | ☐ |
| **Données** | L'accès aux collections est en liste blanche | ☐ |
| **Données** | Limites de taille des résultats appliquées | ☐ |
| **Stockage** | URLs pré-signées utilisées pour les téléversements/téléchargements | ☐ |
| **Stockage** | Type et taille de fichier validés côté serveur | ☐ |
| **Stockage** | Traversée de chemin empêchée | ☐ |
| **Permissions** | Les permissions côté client répliquent les règles côté serveur | ☐ |
| **Permissions** | L'attribution des rôles est restreinte aux administrateurs | ☐ |
| **Général** | HTTPS appliqué | ☐ |
| **Général** | CORS restreint au domaine du CMS | ☐ |
| **Général** | Rate limiting sur tous les endpoints de l'API | ☐ |
| **Général** | En-têtes CSP configurés | ☐ |
| **Général** | Aucun secret dans le code frontend | ☐ |
| **Général** | Auth et TLS MongoDB activés | ☐ |
| **Général** | Dépendances auditées régulièrement | ☐ |
