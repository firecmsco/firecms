---
slug: docs/self/security_best_practices
title: Security Best Practices for Self-Hosted FireCMS
sidebar_label: Security Best Practices
description: A comprehensive guide to securing your self-hosted FireCMS deployment when using a custom backend with MongoDB, custom authentication, and custom file storage.
---

FireCMS is a **frontend-only React application**. It has no built-in server component that enforces security. This means that **all security must be implemented and enforced on your backend**. FireCMS client-side permissions (the `permissions` callback on collections) control the UI/UX — they hide buttons and disable forms — but they can be bypassed by any user with access to browser developer tools.

This guide covers everything you need to know to secure your self-hosted FireCMS deployment when using **MongoDB**, **custom authentication**, and **custom file storage** — without Firebase.

:::caution[Golden Rule]
**Never trust the client.** Every operation that reads, writes, or deletes data must be validated and authorized on your server. Client-side checks are for user experience only.
:::

---

## Architecture Overview

A secure self-hosted FireCMS deployment has the following architecture:

```
┌─────────────────┐       HTTPS        ┌──────────────────┐
│  FireCMS React  │ ──────────────────▶ │  Your API Server │
│   (Browser)     │ ◀────────────────── │  (Express/Nest)  │
└─────────────────┘                     └──────┬───────────┘
                                               │
                        ┌──────────────────────┤
                        │                      │
                 ┌──────▼──────┐       ┌───────▼──────┐
                 │   MongoDB   │       │ File Storage │
                 │  (Database) │       │  (S3/Minio)  │
                 └─────────────┘       └──────────────┘
```

Key points:
- The browser **never** talks directly to MongoDB or your storage backend.
- Your API server is the single entry point that authenticates every request, authorizes the action, validates inputs, and then interacts with the database and storage.

---

## 1. Implementing a Secure AuthController

The `AuthController` interface manages the user's authentication state in the browser. When using a custom backend, your implementation should be a React hook that communicates with your own API.

### Interface Recap

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

#### Token Management (`getAuthToken`)

Your `getAuthToken` implementation is the cornerstone of the entire security model — every request your `DataSourceDelegate` and `StorageSource` make will call it to attach credentials.

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

  // On mount, check for an existing session
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
      // No valid session
    }
  }, []);

  const getAuthToken = useCallback(async (): Promise<string> => {
    if (!accessToken) throw new Error("Not authenticated");

    // Optional: check expiry and refresh
    // const decoded = decodeJwt(accessToken);
    // if (decoded.exp * 1000 < Date.now()) { ... refresh ... }

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

**Key Security Points:**

| Concern | Recommendation |
|---|---|
| **Token storage** | Store JWTs in `httpOnly`, `Secure`, `SameSite=Strict` cookies when possible. If you must use in-memory tokens, never store them in `localStorage` or `sessionStorage`. |
| **Token expiry** | Use short-lived access tokens (5–15 minutes) with a refresh token flow. |
| **Token refresh** | Implement transparent token refresh in `getAuthToken` before expiry. |
| **Session invalidation** | `signOut` must call your server to invalidate the refresh token / session. A client-side-only logout is not secure. |
| **Initial loading** | Use `initialLoading` to silently check for an existing session on app mount. |

#### Authenticator Function

The `Authenticator` callback allows you to control **which authenticated users can access FireCMS**. Use it to load the user's role from your database and attach it to the auth controller.

```typescript
import type { Authenticator } from "@firecms/core";

const myAuthenticator: Authenticator<CustomUser> = async ({
  user,
  authController,
  dataSourceDelegate
}) => {
  if (!user?.email) return false;

  try {
    // Fetch the user profile from your backend (not MongoDB directly!)
    const users = await dataSourceDelegate.fetchCollection({
      path: "cms_users",
      filter: { email: ["==", user.email] }
    });

    if (users.length === 0) return false;

    const profile = users[0].values;
    authController.setExtra({ role: profile.role });
    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
};
```

:::tip
This callback runs on the client. **Your API server must still independently verify that the requesting user has the claimed role** on every request. The `Authenticator` is for UI gating only.
:::

---

## 2. Securing Your DataSourceDelegate (MongoDB)

The `DataSourceDelegate` is the interface FireCMS uses to read and write data. When backed by MongoDB, your implementation should **proxy every call through your authenticated API server**.

### Never Expose MongoDB to the Browser

This is the most critical rule. Do not use the MongoDB driver, Realm SDK, or any direct database connection in the browser.

```typescript
// ❌ DANGEROUS — direct MongoDB access from the browser
import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb+srv://user:password@cluster...");

// ✅ CORRECT — proxy through your authenticated API
const response = await fetch("/api/data/products", {
  headers: { Authorization: `Bearer ${await authController.getAuthToken()}` }
});
```

### Example: Secure DataSourceDelegate

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
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
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
      // Generate a client-side ID; the server should validate / regenerate
      return crypto.randomUUID();
    },

    delegateToCMSModel: (data: any) => data,
    cmsToDelegateModel: (data: any) => data,
  };
}
```

### Server-Side Security Checklist

Your API server (e.g. Express, Fastify, NestJS) must enforce the following on **every** request:

#### Authentication

```typescript
// Express middleware example
import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
```

#### Authorization

```typescript
// Check the user's role before executing any CRUD operation
function authorize(requiredRole: string) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    // Look up the user's role in your database — don't trust the token's role claim alone
    // unless the token is server-signed and verified above
    if (user.role !== "admin" && user.role !== requiredRole) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

app.delete("/api/data/:path/:id", authenticate, authorize("admin"), async (req, res) => {
  // Only admins can delete
});
```

#### Input Validation & NoSQL Injection Prevention

MongoDB is vulnerable to NoSQL injection when user input is passed directly to query operators.

```typescript
// ❌ VULNERABLE — user input goes directly into the query
app.get("/api/data/:collection", async (req, res) => {
  const filter = JSON.parse(req.query.filter); // attacker can inject {$gt: ""}
  const docs = await db.collection(req.params.collection).find(filter).toArray();
  res.json(docs);
});

// ✅ SECURE — sanitize and whitelist
import mongo from "mongo-sanitize";

app.get("/api/data/:collection", authenticate, async (req, res) => {
  // 1. Whitelist allowed collections
  const allowedCollections = ["products", "orders", "categories"];
  if (!allowedCollections.includes(req.params.collection)) {
    return res.status(400).json({ error: "Invalid collection" });
  }

  // 2. Sanitize the filter to remove any MongoDB operators
  let filter = {};
  if (req.query.filter) {
    filter = mongo.sanitize(JSON.parse(req.query.filter));
  }

  // 3. Enforce limits
  const limit = Math.min(parseInt(req.query.limit) || 25, 100);

  const docs = await db
    .collection(req.params.collection)
    .find(filter)
    .limit(limit)
    .toArray();

  res.json(docs);
});
```

**Key Validations:**

| Check | Why |
|---|---|
| **Whitelist collections** | Prevent access to system collections (`admin`, `local`) or internal collections |
| **Sanitize filter operators** | Block `$where`, `$gt`, `$regex`, and other operators that can be injected |
| **Limit result size** | Prevent denial-of-service via unbounded queries |
| **Validate `orderBy` fields** | Only allow sorting on indexed/known fields |
| **Validate `entityId` format** | Ensure IDs match expected format (e.g. UUID or ObjectId pattern) |
| **Validate `values` on save** | Run schema validation (e.g. Zod, Joi) on the server before writing |

---

## 3. Securing Your StorageSource

The `StorageSource` interface handles file uploads and downloads. When using custom storage (S3, MinIO, GCS, or a local filesystem), the key principle is: **never expose storage credentials to the browser**.

### Interface Recap

```typescript
interface StorageSource {
  uploadFile: (props: UploadFileProps) => Promise<UploadFileResult>;
  getDownloadURL: (pathOrUrl: string, bucket?: string) => Promise<DownloadConfig>;
  getFile: (path: string, bucket?: string) => Promise<File | null>;
  deleteFile: (path: string, bucket?: string) => Promise<void>;
  list: (path: string, options?: { ... }) => Promise<StorageListResult>;
}
```

### Use Pre-Signed URLs for Uploads

Instead of passing S3/GCS credentials to the browser, have your server generate short-lived pre-signed URLs:

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

      // 1. Get a pre-signed upload URL from your server
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

      // 2. Upload directly to storage using the pre-signed URL
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

### Server-Side Storage Security

Your storage API endpoint must enforce:

| Concern | Recommendation |
|---|---|
| **File type validation** | Whitelist allowed MIME types (e.g. `image/jpeg`, `application/pdf`). Reject executables. |
| **File size limits** | Enforce maximum file sizes (e.g. 10 MB for images, 50 MB for documents). |
| **Path traversal prevention** | Sanitize the `path` parameter. Reject `..`, absolute paths, or null bytes. Never let clients dictate where files are stored without validation. |
| **Pre-signed URL expiry** | Keep upload/download URLs short-lived (5–15 minutes). |
| **Virus scanning** | For user-uploaded content, consider integrating ClamAV or a cloud-based scanning service. |
| **Access scoping** | Each pre-signed URL should grant access to exactly one file. Use the user's identity to scope which paths they can access. |

#### Server-Side Path Validation Example

```typescript
function validateStoragePath(path: string): boolean {
  // Block path traversal
  if (path.includes("..") || path.startsWith("/")) return false;

  // Block null bytes
  if (path.includes("\0")) return false;

  // Whitelist allowed path prefixes
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
    return res.status(400).json({ error: "Invalid path" });
  }
  if (!validateFileType(contentType)) {
    return res.status(400).json({ error: "File type not allowed" });
  }
  if (size > 10 * 1024 * 1024) { // 10 MB
    return res.status(400).json({ error: "File too large" });
  }

  // Generate and return pre-signed URL...
});
```

---

## 4. Permissions and Role-Based Access Control

FireCMS has a built-in `Permissions` system and a `PermissionsBuilder` callback that you can use on each collection. **These are UI-level controls** — they determine which buttons are shown and which forms are editable.

### Client-Side Permissions (UI Only)

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

### Mirror Permissions on the Server

Your API must enforce the **exact same rules**:

```typescript
// permissions.ts — shared logic (or replicated server-side)
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
  // ... other collections
};

function checkPermission(
  collection: string,
  action: "read" | "create" | "edit" | "delete",
  role: Role
): boolean {
  return collectionPermissions[collection]?.[role]?.[action] ?? false;
}

// Express middleware
function requirePermission(action: "read" | "create" | "edit" | "delete") {
  return (req, res, next) => {
    const collection = req.params.path;
    const role = req.user.role;
    if (!checkPermission(collection, action, role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
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
If a user can modify their own role in the database (e.g. setting `role: "admin"` on their own user document), your permission system is broken. **Always restrict writes to user/role collections to admin-only operations.**
:::

---

## 5. General Security Best Practices

### Transport Security

- **Always use HTTPS** in production. Use TLS 1.2+ with strong cipher suites.
- Set `Strict-Transport-Security` (HSTS) headers.
- Redirect all HTTP traffic to HTTPS.

### CORS Configuration

Configure CORS on your API server to allow only your FireCMS domain:

```typescript
import cors from "cors";

app.use(cors({
  origin: "https://your-admin-panel.example.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

:::caution
**Never use `origin: "*"`** in production, especially when `credentials: true` is set. This allows any website to make authenticated requests to your API.
:::

### Rate Limiting

Protect your API from brute-force attacks and abuse:

```typescript
import rateLimit from "express-rate-limit";

// General API rate limit
app.use("/api/", rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500
}));

// Stricter limit for auth endpoints
app.use("/api/auth/", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
}));
```

### Content Security Policy

Set CSP headers to prevent XSS attacks:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://your-storage.example.com;
  connect-src 'self' https://your-api.example.com;
```

### Secrets Management

| ❌ Don't | ✅ Do |
|---|---|
| Hardcode API keys in frontend code | Use environment variables on the server |
| Commit `.env` files to Git | Use a secrets manager (Vault, AWS Secrets Manager, Doppler) |
| Share MongoDB connection strings with the client | Keep all database connections server-side only |
| Use the same JWT secret across environments | Use unique secrets per environment |

### MongoDB-Specific Security

- **Enable authentication** on your MongoDB cluster. Never run without auth.
- **Use a dedicated database user** for your API with the minimum required permissions.
- **Enable TLS** for connections between your API and MongoDB.
- **Network access control**: restrict which IPs can connect to your MongoDB cluster.
- **Enable audit logging** if your MongoDB plan supports it.

### Dependency Security

- Run `npm audit` regularly and address vulnerabilities.
- Pin major dependency versions in `package.json`.
- Use `npm audit fix` or tools like [Snyk](https://snyk.io) or [Socket](https://socket.dev) for continuous monitoring.

---

## Summary Checklist

| Area | Requirement | Status |
|---|---|---|
| **Auth** | JWT/session tokens are server-signed and validated | ☐ |
| **Auth** | Tokens are short-lived with refresh flow | ☐ |
| **Auth** | `signOut` invalidates server-side session | ☐ |
| **Auth** | Tokens stored in httpOnly cookies (preferred) | ☐ |
| **Data** | All CRUD goes through authenticated API | ☐ |
| **Data** | MongoDB never exposed to browser | ☐ |
| **Data** | Server validates and sanitizes all inputs | ☐ |
| **Data** | NoSQL injection prevention in place | ☐ |
| **Data** | Collection access is whitelisted | ☐ |
| **Data** | Result size limits enforced | ☐ |
| **Storage** | Pre-signed URLs used for uploads/downloads | ☐ |
| **Storage** | File type and size validated server-side | ☐ |
| **Storage** | Path traversal prevented | ☐ |
| **Permissions** | Client-side permissions mirror server-side rules | ☐ |
| **Permissions** | Role assignment restricted to admins | ☐ |
| **General** | HTTPS enforced | ☐ |
| **General** | CORS restricted to CMS domain | ☐ |
| **General** | Rate limiting on all API endpoints | ☐ |
| **General** | CSP headers configured | ☐ |
| **General** | No secrets in frontend code | ☐ |
| **General** | MongoDB auth and TLS enabled | ☐ |
| **General** | Dependencies audited regularly | ☐ |
