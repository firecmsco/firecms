---
slug: pt/docs/self/security_best_practices
title: Boas práticas de segurança para FireCMS self-hosted
sidebar_label: Boas práticas de segurança
description: Guia completo para proteger seu deployment self-hosted do FireCMS ao usar um backend personalizado com MongoDB, autenticação personalizada e armazenamento de arquivos personalizado.
---

O FireCMS é uma **aplicação React exclusivamente frontend**. Ele não possui nenhum componente de servidor integrado que aplique segurança. Isso significa que **toda a segurança deve ser implementada e aplicada no seu backend**. As permissões do lado do cliente do FireCMS (o callback `permissions` nas coleções) controlam a UI/UX — elas ocultam botões e desabilitam formulários — mas podem ser contornadas por qualquer usuário com acesso às ferramentas de desenvolvedor do navegador.

Este guia cobre tudo o que você precisa saber para proteger seu deployment self-hosted do FireCMS ao usar **MongoDB**, **autenticação personalizada** e **armazenamento de arquivos personalizado** — sem Firebase.

:::caution[Regra de ouro]
**Nunca confie no cliente.** Toda operação que lê, escreve ou exclui dados deve ser validada e autorizada no seu servidor. As verificações do lado do cliente servem apenas para a experiência do usuário.
:::

---

## Visão geral da arquitetura

Um deployment self-hosted seguro do FireCMS tem a seguinte arquitetura:

```
┌─────────────────┐       HTTPS        ┌──────────────────┐
│  FireCMS React  │ ──────────────────▶ │ Seu servidor API │
│   (Navegador)   │ ◀────────────────── │  (Express/Nest)  │
└─────────────────┘                     └──────┬───────────┘
                                               │
                        ┌──────────────────────┤
                        │                      │
                 ┌──────▼──────┐       ┌───────▼──────┐
                 │   MongoDB   │       │Armazenamento │
                 │ (Banco de   │       │  de arquivos │
                 │  dados)     │       │  (S3/Minio)  │
                 └─────────────┘       └──────────────┘
```

Pontos-chave:
- O navegador **nunca** se comunica diretamente com o MongoDB ou seu backend de armazenamento.
- Seu servidor API é o ponto de entrada único que autentica cada requisição, autoriza a ação, valida as entradas, e então interage com o banco de dados e o armazenamento.

---

## 1. Implementar um AuthController seguro

A interface `AuthController` gerencia o estado de autenticação do usuário no navegador. Ao usar um backend personalizado, sua implementação deve ser um hook React que se comunica com sua própria API.

### Resumo da interface

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

### Boas práticas

#### Gerenciamento de tokens (`getAuthToken`)

Sua implementação de `getAuthToken` é a pedra angular de todo o modelo de segurança — cada requisição que seu `DataSourceDelegate` e `StorageSource` fazem irá chamá-la para anexar credenciais.

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

  // Ao montar, verificar se existe uma sessão
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
      // Sem sessão válida
    }
  }, []);

  const getAuthToken = useCallback(async (): Promise<string> => {
    if (!accessToken) throw new Error("Não autenticado");
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

**Pontos-chave de segurança:**

| Aspecto | Recomendação |
|---|---|
| **Armazenamento de tokens** | Armazene os JWTs em cookies `httpOnly`, `Secure`, `SameSite=Strict` quando possível. Se precisar usar tokens em memória, nunca os armazene em `localStorage` ou `sessionStorage`. |
| **Expiração de tokens** | Use tokens de acesso de curta duração (5–15 minutos) com um fluxo de refresh token. |
| **Renovação de tokens** | Implemente a renovação transparente de tokens em `getAuthToken` antes da expiração. |
| **Invalidação de sessão** | `signOut` deve chamar seu servidor para invalidar o refresh token / sessão. Um logout apenas do lado do cliente não é seguro. |
| **Carregamento inicial** | Use `initialLoading` para verificar silenciosamente se existe uma sessão ao montar a app. |

#### Função Authenticator

O callback `Authenticator` permite controlar **quais usuários autenticados podem acessar o FireCMS**. Use-o para carregar o papel do usuário do seu banco de dados e anexá-lo ao controller de autenticação.

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
    console.error("Erro de autenticação:", error);
    return false;
  }
};
```

:::tip
Este callback é executado no cliente. **Seu servidor API deve verificar independentemente que o usuário solicitante possui o papel declarado** em cada requisição. O `Authenticator` serve apenas para controle da interface.
:::

---

## 2. Proteger seu DataSourceDelegate (MongoDB)

O `DataSourceDelegate` é a interface que o FireCMS usa para ler e escrever dados. Quando apoiado pelo MongoDB, sua implementação deve **fazer proxy de cada chamada através do seu servidor API autenticado**.

### Nunca exponha o MongoDB ao navegador

Esta é a regra mais crítica. Não use o driver do MongoDB, o SDK Realm, nem qualquer conexão direta ao banco de dados no navegador.

```typescript
// ❌ PERIGOSO — acesso direto ao MongoDB a partir do navegador
import { MongoClient } from "mongodb";
const client = new MongoClient("mongodb+srv://user:password@cluster...");

// ✅ CORRETO — proxy através da sua API autenticada
const response = await fetch("/api/data/products", {
  headers: { Authorization: `Bearer ${await authController.getAuthToken()}` }
});
```

### Exemplo: DataSourceDelegate seguro

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
      throw new Error("Não autorizado");
    }
    if (!res.ok) {
      throw new Error(`Erro da API: ${res.status}`);
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

### Checklist de segurança do servidor

Seu servidor API (ex. Express, Fastify, NestJS) deve aplicar o seguinte em **cada** requisição:

#### Autenticação

```typescript
import jwt from "jsonwebtoken";

function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Token ausente" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
```

#### Autorização

```typescript
function authorize(requiredRole: string) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "Não autenticado" });

    if (user.role !== "admin" && user.role !== requiredRole) {
      return res.status(403).json({ error: "Permissões insuficientes" });
    }
    next();
  };
}

app.delete("/api/data/:path/:id", authenticate, authorize("admin"), async (req, res) => {
  // Apenas administradores podem excluir
});
```

#### Validação de entrada e prevenção de injeção NoSQL

O MongoDB é vulnerável a injeção NoSQL quando a entrada do usuário é passada diretamente para operadores de consulta.

```typescript
// ❌ VULNERÁVEL — entrada do usuário vai diretamente para a consulta
app.get("/api/data/:collection", async (req, res) => {
  const filter = JSON.parse(req.query.filter);
  const docs = await db.collection(req.params.collection).find(filter).toArray();
  res.json(docs);
});

// ✅ SEGURO — sanitizar e usar whitelist
import mongo from "mongo-sanitize";

app.get("/api/data/:collection", authenticate, async (req, res) => {
  // 1. Whitelist de coleções permitidas
  const allowedCollections = ["products", "orders", "categories"];
  if (!allowedCollections.includes(req.params.collection)) {
    return res.status(400).json({ error: "Coleção inválida" });
  }

  // 2. Sanitizar o filtro para remover operadores do MongoDB
  let filter = {};
  if (req.query.filter) {
    filter = mongo.sanitize(JSON.parse(req.query.filter));
  }

  // 3. Aplicar limites
  const limit = Math.min(parseInt(req.query.limit) || 25, 100);

  const docs = await db
    .collection(req.params.collection)
    .find(filter)
    .limit(limit)
    .toArray();

  res.json(docs);
});
```

**Validações-chave:**

| Verificação | Por quê |
|---|---|
| **Whitelist de coleções** | Prevenir acesso a coleções do sistema (`admin`, `local`) ou internas |
| **Sanitizar operadores de filtro** | Bloquear `$where`, `$gt`, `$regex` e outros operadores injetáveis |
| **Limitar tamanho dos resultados** | Prevenir negação de serviço via consultas sem limite |
| **Validar campos `orderBy`** | Permitir ordenação apenas em campos indexados/conhecidos |
| **Validar formato do `entityId`** | Garantir que IDs correspondam ao formato esperado (ex. UUID ou ObjectId) |
| **Validar `values` ao salvar** | Executar validação de esquema (ex. Zod, Joi) no servidor antes da escrita |

---

## 3. Proteger seu StorageSource

A interface `StorageSource` gerencia o upload e download de arquivos. Ao usar armazenamento personalizado (S3, MinIO, GCS, ou um sistema de arquivos local), o princípio-chave é: **nunca exponha credenciais de armazenamento ao navegador**.

### Resumo da interface

```typescript
interface StorageSource {
  uploadFile: (props: UploadFileProps) => Promise<UploadFileResult>;
  getDownloadURL: (pathOrUrl: string, bucket?: string) => Promise<DownloadConfig>;
  getFile: (path: string, bucket?: string) => Promise<File | null>;
  deleteFile: (path: string, bucket?: string) => Promise<void>;
  list: (path: string, options?: { ... }) => Promise<StorageListResult>;
}
```

### Use URLs pré-assinadas para uploads

Em vez de passar credenciais S3/GCS ao navegador, faça seu servidor gerar URLs pré-assinadas de curta duração:

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

### Segurança do armazenamento no lado do servidor

Seu endpoint de API de armazenamento deve aplicar:

| Aspecto | Recomendação |
|---|---|
| **Validação de tipo de arquivo** | Whitelist de tipos MIME permitidos (ex. `image/jpeg`, `application/pdf`). Rejeitar executáveis. |
| **Limites de tamanho de arquivo** | Aplicar tamanhos máximos (ex. 10 MB para imagens, 50 MB para documentos). |
| **Prevenção de path traversal** | Sanitizar o parâmetro `path`. Rejeitar `..`, caminhos absolutos ou bytes nulos. |
| **Expiração de URLs pré-assinadas** | Manter URLs de upload/download de curta duração (5–15 minutos). |
| **Verificação de vírus** | Para conteúdo enviado por usuários, considere integrar ClamAV ou um serviço de verificação em nuvem. |
| **Escopo de acesso** | Cada URL pré-assinada deve conceder acesso a exatamente um arquivo. |

#### Exemplo de validação de caminho no lado do servidor

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
    return res.status(400).json({ error: "Caminho inválido" });
  }
  if (!validateFileType(contentType)) {
    return res.status(400).json({ error: "Tipo de arquivo não permitido" });
  }
  if (size > 10 * 1024 * 1024) {
    return res.status(400).json({ error: "Arquivo muito grande" });
  }

  // Gerar e retornar URL pré-assinada...
});
```

---

## 4. Permissões e controle de acesso baseado em papéis

O FireCMS tem um sistema de `Permissions` integrado e um callback `PermissionsBuilder` que você pode usar em cada coleção. **Esses são controles em nível de UI** — eles determinam quais botões são exibidos e quais formulários são editáveis.

### Permissões do lado do cliente (apenas UI)

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

### Replicar permissões no servidor

Sua API deve aplicar as **mesmas regras exatas**:

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
      return res.status(403).json({ error: "Permissões insuficientes" });
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
Se um usuário pode modificar seu próprio papel no banco de dados (ex. definir `role: "admin"` no seu próprio documento de usuário), seu sistema de permissões está comprometido. **Sempre restrinja as escritas às coleções de usuário/papéis apenas a operações de administrador.**
:::

---

## 5. Boas práticas gerais de segurança

### Segurança de transporte

- **Sempre use HTTPS** em produção. Use TLS 1.2+ com suítes de cifra robustas.
- Defina os cabeçalhos `Strict-Transport-Security` (HSTS).
- Redirecione todo o tráfego HTTP para HTTPS.

### Configuração CORS

Configure CORS no seu servidor API para permitir apenas seu domínio FireCMS:

```typescript
import cors from "cors";

app.use(cors({
  origin: "https://seu-painel-admin.exemplo.com",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

:::caution
**Nunca use `origin: "*"`** em produção, especialmente quando `credentials: true` está ativado. Isso permite que qualquer site faça requisições autenticadas à sua API.
:::

### Rate Limiting

Proteja sua API contra ataques de força bruta e abuso:

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

Defina cabeçalhos CSP para prevenir ataques XSS:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://seu-armazenamento.exemplo.com;
  connect-src 'self' https://sua-api.exemplo.com;
```

### Gerenciamento de segredos

| ❌ Não faça | ✅ Faça |
|---|---|
| Codificar chaves de API no código frontend | Usar variáveis de ambiente no servidor |
| Fazer commit de arquivos `.env` no Git | Usar um gerenciador de segredos (Vault, AWS Secrets Manager, Doppler) |
| Compartilhar strings de conexão do MongoDB com o cliente | Manter todas as conexões ao banco de dados apenas no lado do servidor |
| Usar o mesmo segredo JWT em todos os ambientes | Usar segredos únicos por ambiente |

### Segurança específica do MongoDB

- **Habilite a autenticação** no seu cluster MongoDB. Nunca execute sem autenticação.
- **Use um usuário de banco de dados dedicado** para sua API com as permissões mínimas necessárias.
- **Habilite TLS** para conexões entre sua API e o MongoDB.
- **Controle de acesso de rede**: restrinja quais IPs podem se conectar ao seu cluster MongoDB.
- **Habilite o log de auditoria** se seu plano do MongoDB suportar.

### Segurança de dependências

- Execute `npm audit` regularmente e resolva as vulnerabilidades.
- Fixe as versões principais das dependências no `package.json`.
- Use `npm audit fix` ou ferramentas como [Snyk](https://snyk.io) ou [Socket](https://socket.dev) para monitoramento contínuo.

---

## Checklist resumo

| Área | Requisito | Status |
|---|---|---|
| **Auth** | Tokens JWT/sessão são assinados e validados pelo servidor | ☐ |
| **Auth** | Tokens são de curta duração com fluxo de renovação | ☐ |
| **Auth** | `signOut` invalida a sessão no lado do servidor | ☐ |
| **Auth** | Tokens armazenados em cookies httpOnly (preferido) | ☐ |
| **Dados** | Todo o CRUD passa por API autenticada | ☐ |
| **Dados** | MongoDB nunca exposto ao navegador | ☐ |
| **Dados** | O servidor valida e sanitiza todas as entradas | ☐ |
| **Dados** | Prevenção de injeção NoSQL implementada | ☐ |
| **Dados** | Acesso às coleções está em whitelist | ☐ |
| **Dados** | Limites de tamanho de resultados aplicados | ☐ |
| **Armazenamento** | URLs pré-assinadas usadas para uploads/downloads | ☐ |
| **Armazenamento** | Tipo e tamanho de arquivo validados no lado do servidor | ☐ |
| **Armazenamento** | Path traversal prevenido | ☐ |
| **Permissões** | Permissões do cliente replicam as regras do servidor | ☐ |
| **Permissões** | Atribuição de papéis restrita a administradores | ☐ |
| **Geral** | HTTPS aplicado | ☐ |
| **Geral** | CORS restrito ao domínio do CMS | ☐ |
| **Geral** | Rate limiting em todos os endpoints da API | ☐ |
| **Geral** | Cabeçalhos CSP configurados | ☐ |
| **Geral** | Nenhum segredo no código frontend | ☐ |
| **Geral** | Auth e TLS do MongoDB habilitados | ☐ |
| **Geral** | Dependências auditadas regularmente | ☐ |
