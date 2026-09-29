# @firecms/mcp-server

MCP server for [FireCMS Cloud](https://firecms.co). Lets AI assistants connect a Firebase project to FireCMS, infer collections from the data already in Firestore, and then manage the CMS — browse and edit data, shape collection schemas and properties, configure the project, and manage users.

> **Admin-only**: All write operations require the authenticated user to have the `admin` role on the target project. Read operations are available to any authenticated project member. Onboarding tools run before a project exists, so they are gated by Google Cloud access instead.

The same server runs in two places:

- **Hosted**, at `https://api.firecms.co/mcp`, for everyone. Clients sign in with OAuth in the browser; nothing to install. It holds no Google Cloud credentials, so connecting a new Firebase project is handed off to the web app. The FireCMS backend mounts it through the `@firecms/mcp-server/hosted` entry point.
- **Local**, over stdio (`npx @firecms/mcp-server`). It signs in with your Google account (`firecms_login`), so it can also enable APIs, create Firestore databases and connect projects end to end.

## Hosted server

In Claude (claude.ai or Claude Desktop): Settings → Connectors → Add custom connector, and paste `https://api.firecms.co/mcp`.

In Claude Code:

```bash
claude mcp add --transport http firecms https://api.firecms.co/mcp
```

Any other client that takes remote servers by URL:

```json
{
  "mcpServers": {
    "firecms": { "url": "https://api.firecms.co/mcp" }
  }
}
```

## Local server

### Setup

```bash
cd packages/mcp_server && npm install && npm run build
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "firecms": {
      "command": "node",
      "args": ["/path/to/packages/mcp_server/dist/cli.js"]
    }
  }
}
```

Or use npx (no build required):

```json
{
  "mcpServers": {
    "firecms": {
      "command": "npx",
      "args": ["@firecms/mcp-server"]
    }
  }
}
```

Use `firecms_login` to sign in when prompted. Tokens are shared with the FireCMS CLI (`~/.firecms/tokens.json`).

## Connecting an existing Firebase project

The typical first session. Everything here is driven by the Google account you logged in with.

```
1. list_firebase_projects        → see which projects you can connect, and what they still need
2. get_project_setup_status      → check one project in detail (optional)
3. enable_project_apis           → only if apisEnabled is false
4. enable_firestore              → only if firestoreEnabled is false (location is permanent)
5. connect_project_to_firecms    → service account, admin user, and the security rules
6. setup_all_collections         → infer every root collection from the existing data
```

Firebase Authentication must be enabled on the project before step 5 — it is the one
prerequisite with no API, so turn it on in the Firebase console. Step 5 then adds
FireCMS's access rule to the project's Firestore and Storage rules; without it the CMS
reports "Missing Firestore Security Rules" and opens nothing, and no tool here would
notice, because they all read through the backend's service account, which bypasses
security rules.

Step 6 is where an existing project becomes a working CMS: FireCMS samples the documents at each root collection, infers the property types, and uses an LLM to pick display names, a singular name, an icon and a navigation group.

## Building collections from existing data

| Tool | Description |
|------|-------------|
| `get_root_collections` | List the Firestore root collections of a project (read live) |
| `list_subcollections` | List the subcollections of a document, to explore nested data |
| `list_databases` | List Firestore databases (only needed beyond `(default)`) |
| `preview_inferred_schema` | Infer a schema from sampled documents **without saving** |
| `infer_collections_from_data` 🔒 | Infer and save collections for chosen paths |
| `setup_all_collections` 🔒 | Infer and save every unmapped root collection |

`preview_inferred_schema` is the non-destructive option: it samples up to 200 documents, infers types, enums and validation locally, and hands back a draft you can edit and then persist with `save_collection_schema`. It also works for subcollections and any path the bulk tools skip.

`infer_collections_from_data` and `setup_all_collections` go through the backend, which adds the LLM pass and writes the result straight into the project. Both skip paths that already map to a collection, so they are safe to re-run as the database grows.

## Tools

### Auth
| Tool | Description |
|------|-------------|
| `firecms_login` 💻 | Sign in via browser (Google OAuth) |
| `firecms_logout` 💻 | Sign out |
| `firecms_get_current_user` | Show current user |

### Onboarding
| Tool | Description |
|------|-------------|
| `list_firebase_projects` 💻 | Google Cloud projects you can access, with FireCMS readiness flags |
| `get_project_setup_status` 💻 | Detailed readiness of one project |
| `list_firestore_locations` 💻 | Locations available for a new Firestore database |
| `enable_project_apis` 💻 | Enable the Google Cloud APIs FireCMS requires |
| `enable_firestore` 💻 | Create the default Firestore database (location is permanent) |
| `connect_project_to_firecms` | Connect an existing Firebase project, and apply the security rules it needs. Hosted: returns the link to connect it in the web app |
| `apply_firestore_security_rules` 🔒 | Add FireCMS's access rule to Firestore and Storage (idempotent) |
| `create_firecms_webapp` 🔒 | Retry web app creation if it failed during connect |

### Projects & Root Collections
| Tool | Description |
|------|-------------|
| `list_projects` | List FireCMS Cloud projects |
| `get_root_collections` | List Firestore root collections |
| `list_subcollections` | List the subcollections of a document |

### Project Configuration 🔒
| Tool | Description |
|------|-------------|
| `get_project_config` | Get full project config (name, colors, plan, features) |
| `update_project_name` | Rename a project |
| `update_project_colors` | Update primary/secondary brand colors |
| `update_default_locale` | Change the default locale |
| `toggle_text_search` | Enable/disable local text search |
| `toggle_entity_history` | Enable/disable entity history tracking |

### Users 🔒
| Tool | Description |
|------|-------------|
| `list_users` | List project users and roles |
| `add_user` | Invite a user |
| `update_user_roles` | Change user roles |
| `remove_user` | Remove a user |

### Collection Schemas 🔒
| Tool | Description |
|------|-------------|
| `list_collection_schemas` | List all persisted collection schemas |
| `get_collection_schema` | Get full schema for a collection |
| `save_collection_schema` | Create or replace a collection schema |
| `update_collection_schema` | Partially update a collection schema |
| `delete_collection_schema` | Delete a collection schema (data untouched) |
| `save_property` | Add or update a single property in a collection |
| `delete_property` | Remove a property from a collection schema |

### AI Schema Generation
| Tool | Description |
|------|-------------|
| `generate_collection` | AI-generate a collection schema from a prompt |
| `modify_collection` | AI-modify an existing schema from a prompt |

### Documents (Firestore CRUD)
| Tool | Description |
|------|-------------|
| `list_documents` | Query documents (filters, ordering, pagination) |
| `get_document` | Get a document by path |
| `create_document` | Create a new document |
| `update_document` | Partial update of a document |
| `delete_document` | Delete a document |
| `count_documents` | Count documents in a collection |

### Data Import & Export
| Tool | Description |
|------|-------------|
| `export_collection` | Export collection data as JSON |
| `import_documents` 🔒 | Bulk import documents (max 500/call) |

> 🔒 = Admin-only operation · 💻 = local server only

Every tool declares a `title` and a `readOnlyHint`, plus a `destructiveHint` when it writes: `false` for tools that only add (create a document, invite a user), `true` for anything that can overwrite or delete.

## Resources

| URI | Description |
|-----|-------------|
| `firecms://projects/{id}/collections` | Firestore root-level collections |
| `firecms://projects/{id}/users` | Project users and roles |
| `firecms://projects/{id}/schemas` | All collection schemas (full config tree) |
| `firecms://projects/{id}/config` | Project configuration snapshot |

## Example Workflows

### Bring an existing Firebase project into FireCMS
```
1. list_firebase_projects        → pick a project that is not yet connected
2. connect_project_to_firecms    → provision it
3. setup_all_collections         → infer collections from the data already there
```

### Create a collection from scratch
```
1. firecms_login          → authenticate
2. list_projects          → pick your project
3. save_collection_schema → define the schema
4. import_documents       → seed with initial data
```

### Shape a schema before committing to it
```
1. preview_inferred_schema  → draft a schema from real documents, nothing saved
2. save_property            → adjust individual fields
3. save_collection_schema   → persist the result
```

### AI-assisted schema creation
```
1. generate_collection    → describe what you want in natural language
2. save_collection_schema → persist the generated schema
```

## Architecture

### Sessions: local and hosted

Nothing reads credentials from process-wide state. Every API call goes through a `FireCMSSession` (`session.ts`) — the user's email, a Firebase ID token on `firecms-backend`, and a Google access token when there is one — passed to `createFireCMSMcpServer()`:

- **Local** (`cli.ts`): `localSession` reads the CLI's tokens file and exchanges the Google ID token for a backend token (below). The login/logout tools are registered by the CLI only.
- **Hosted** (`hosted.ts`): the backend resolves each request's OAuth bearer token to a user and passes a session that mints that user's backend ID token. There is no Google token, so the Google Cloud tools are replaced by a `connect_project_to_firecms` that links to the web app. Every request gets its own server and transport (stateless Streamable HTTP), so nothing of one person's session outlives their request. `hosted.ts` never imports the CLI's login flow; a test walks its import graph to keep it that way.

### Authentication

The FireCMS Cloud API expects two different tokens, and the server sends both — the same pair the web app sends:

| Header | Token | Used by |
|--------|-------|---------|
| `Authorization` | Firebase ID token issued by `firecms-backend` | endpoints gated by `firebaseAuthorization()` — most of the API |
| `x-admin-authorization` | Google OAuth access token (`cloud-platform` scope) | endpoints gated by `googleCloudAuthentication()` — GCP provisioning. Local sessions only |

`firecms login` only produces the Google credentials. The Google **ID token** is not a Firebase ID token — it is issued by `accounts.google.com` for the Google OAuth client, so `verifyIdToken()` rejects it. `backend-auth.ts` therefore exchanges it for a real `firecms-backend` token through Identity Toolkit `signInWithIdp`, which is the headless equivalent of the web app's `signInWithPopup(auth, GoogleAuthProvider)`. The exchanged token is cached in memory until shortly before it expires.

### Where collection configurations live

FireCMS Cloud reads collection configurations from the **backend** Firestore, at `projects/{projectId}/collections/{collectionId}` — see `useFirestoreCollectionsConfigController` in `FireCMSCloudApp.tsx`. That is *not* the client project's `__FIRECMS/config/collections`, which is the self-hosted layout and is never read by Cloud.

The backend exposes no REST endpoints for that store — the web app writes to it directly with the Firebase SDK — so `backend-firestore.ts` talks to the Firestore REST API with the exchanged Firebase token. The backend's security rules apply unchanged.

Document CRUD is different: it is proxied by the backend into the *client's* Firestore using the project's delegated service account.

### Cache-aware collection discovery

The backend's `firestore_root_collections` endpoint caches its answer for 5 minutes per project, so it misses collections created since the last lookup — including every collection of a project connected moments ago. Discovery therefore goes through the uncached `admin/collections/list` endpoint, and `setup_all_collections` resolves the paths itself rather than delegating to `initial_setup`, which resolves them through that same cache.

`infer_collections_from_data` also refuses paths with no documents. The backend runs its LLM pass regardless, and with nothing to sample the model invents a schema from the path name alone — an empty `articles` path yields plausible `title`/`slug`/`status`/`author` fields that exist nowhere in the data.

### stdout is reserved

On a stdio transport, stdout carries the JSON-RPC stream, so `cli.ts` routes every console channel to stderr before starting. Dependencies do log — `@firecms/schema_inference` logs while inferring properties — and a single stray `console.log` would corrupt the protocol stream.

## Security

- **Hosted authentication**: OAuth 2.1 with PKCE against the FireCMS backend; the person approves each client in the web app. The backend stores tokens only as hashes, rotates refresh tokens, and never holds Google Cloud credentials
- **Local authentication**: Google OAuth via browser, same as `firecms login` CLI
- **Authorization**: Write operations enforce admin role check per project
- **Token storage**: `~/.firecms/tokens.json` (shared with CLI); the exchanged backend token is held in memory only and dropped on logout
- **Admin cache**: Role checks are cached for 5 minutes per project
- **Credential hygiene**: `list_projects` strips each project's service account from its output, so credentials are never serialised into the model's context
