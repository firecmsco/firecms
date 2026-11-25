# FireCMS MCP server tools

Source: `packages/mcp_server/src/tools/` (`@firecms/mcp-server`). Hosted at
`https://api.firecms.co/mcp`; local with `npx -y @firecms/mcp-server`.

- **(admin)** needs the `admin` role on the project.
- **(local)** local server only (it holds Google credentials; the hosted server does not).
- Every tool declares `readOnlyHint`, and `destructiveHint` when it writes (`true` when it can
  overwrite or delete).
- Every project tool takes `projectId`, from `list_projects`. Most document and introspection
  tools take an optional `databaseId` for databases other than `(default)`.

## Account

| Tool | Inputs | Does |
|---|---|---|
| `firecms_get_current_user` | | Who is signed in. |
| `firecms_login` (local) | | Browser Google sign-in; tokens in `~/.firecms/tokens.json`. |
| `firecms_logout` (local) | | Sign out. |

## Onboarding

| Tool | Inputs | Does |
|---|---|---|
| `connect_project_to_firecms` | hosted: `projectId?`; local: `projectId`, `creationType?: "existing" \| "new"`, `applySecurityRules?` | Hosted: returns the link `https://app.firecms.co/new` to connect in the web app. Local: creates the service account, admin user and applies the security rules. |
| `list_firebase_projects` (local) | | Google Cloud projects you can access, with readiness flags (`apisEnabled`, `firestoreEnabled`, ...). |
| `get_project_setup_status` (local) | `projectId` | Detailed readiness of one project. |
| `list_firestore_locations` (local) | | Locations for a new Firestore database. |
| `enable_project_apis` (local) | `projectId` | Enable the Google Cloud APIs FireCMS needs. |
| `enable_firestore` (local) | `projectId`, `locationId` | Create the default Firestore database. The location is permanent. |
| `apply_firestore_security_rules` (admin) | `projectId` | Add FireCMS's access rule to Firestore and Storage rules (idempotent). Without it the CMS reports "Missing Firestore Security Rules". |
| `create_firecms_webapp` (admin) | `projectId` | Retry the Firebase web app creation if it failed during connect. |

Firebase Authentication must be enabled in the Firebase console before connecting: it has no API.

## Projects and Firestore structure

| Tool | Inputs | Does |
|---|---|---|
| `list_projects` | | Your FireCMS Cloud projects (credentials stripped). Call first. |
| `get_root_collections` | `projectId`, `databaseId?` | Firestore root collections, read live. |
| `list_subcollections` | `projectId`, `parentDocumentPath`, `databaseId?` | Subcollections of a document. |
| `list_databases` (admin) | `projectId` | Firestore databases, when more than `(default)`. |

## Building collections from data

| Tool | Inputs | Does |
|---|---|---|
| `preview_inferred_schema` (admin) | `projectId`, `path`, `sampleSize?` (1-200), `databaseId?` | Infer a schema from sampled documents. Saves nothing. Works for any path, subcollections included. |
| `infer_collections_from_data` (admin) | `projectId`, `paths: [{ path, databaseId? }]` | Infer and save collections for those paths (LLM picks names, icon, group, widgets). Skips mapped and empty paths. |
| `setup_all_collections` (admin) | `projectId`, `databaseId?` | Infer and save every unmapped root collection. Safe to re-run. |

## Collection schemas

| Tool | Inputs | Does |
|---|---|---|
| `list_collection_schemas` (admin) | `projectId` | All persisted collection schemas. |
| `get_collection_schema` (admin) | `projectId`, `collectionId` | One schema, with all properties. |
| `save_collection_schema` (admin) | `projectId`, `collectionId`, `schema: { path, name, properties, singularName?, description?, icon?, group?, propertiesOrder?, defaultSize?, initialSort?, ... }` | Create or **fully replace** a collection. |
| `update_collection_schema` (admin) | `projectId`, `collectionId`, `data` | Merge top-level fields into a schema. |
| `delete_collection_schema` (admin) | `projectId`, `collectionId` | Remove the collection from the CMS. Firestore data untouched. |
| `save_property` (admin) | `projectId`, `collectionId`, `propertyKey`, `property`, `namespace?` | Add or update one property; new ones go last in the order. `namespace` is the dot path of a parent map. |
| `delete_property` (admin) | `projectId`, `collectionId`, `propertyKey`, `namespace?` | Remove one property from the schema (data untouched). |
| `generate_collection` | `prompt`, `existingCollections?` | AI-generate a schema from a description. Returns it; save with `save_collection_schema`. |
| `modify_collection` | `prompt`, `existingCollection`, `existingCollections?` | AI-modify a schema you pass in. Returns it; save it yourself. |

`property` accepts `dataType` (`string`, `number`, `boolean`, `date`, `map`, `array`, `geopoint`,
`reference`), `name`, `description`, `validation`, `enumValues: [{ id, label, color? }]`,
`multiline`, `markdown`, `url` (`true` or `"image" | "video" | "audio"`), `email`,
`storage: { storagePath, acceptedFiles?, maxSize? }`, `of` (arrays), `properties` (maps),
`path` and `previewProperties` (references), `disabled`, `columnWidth`, `hideFromCollection`, and
other `EntityCollection` property options (passed through).

## Documents

| Tool | Inputs | Does |
|---|---|---|
| `list_documents` | `projectId`, `collectionPath`, `limit?` (default 20), `orderBy?`, `orderDirection?`, `filters?: [{ field, op, value }]`, `databaseId?` | Query. `op`: `==`, `!=`, `<`, `<=`, `>`, `>=`, `array-contains`, `in`, `array-contains-any`, `not-in`. |
| `get_document` | `projectId`, `collectionPath`, `documentId`, `databaseId?` | One document. |
| `create_document` | `projectId`, `collectionPath`, `data`, `documentId?`, `databaseId?` | New document. |
| `update_document` | `projectId`, `collectionPath`, `documentId`, `data`, `databaseId?` | Partial update (merge). |
| `delete_document` | `projectId`, `collectionPath`, `documentId`, `databaseId?` | Permanent delete. |
| `count_documents` | `projectId`, `collectionPath`, `databaseId?` | Count. |
| `export_collection` | `projectId`, `collectionPath`, `limit?`, `databaseId?` | Export as JSON. |
| `import_documents` (admin) | `projectId`, `collectionPath`, `documents: [{ id?, data }]` (max 500), `merge?`, `databaseId?` | Bulk write. Without `merge`, documents are overwritten. |

Special values in filters and documents: dates `{ _seconds, _nanoseconds }`, references
`{ _ref: "collection/docId" }`, geopoints `{ _lat, _long }`.

## Storage

| Tool | Inputs | Does |
|---|---|---|
| `upload_storage_file` | `projectId`, `path`, `base64Data?` or `sourceUrl?`, `contentType?`, `bucketName?` | Upload a file to the project's bucket; returns a download URL. |
| `list_storage_files` | `projectId`, `prefix?`, `limit?` (default 50, max 200), `bucketName?` | List files under a prefix, with download URLs when available. |

## Project configuration

| Tool | Inputs | Does |
|---|---|---|
| `get_project_config` (admin) | `projectId` | Name, colors, plan, features. |
| `update_project_name` (admin) | `projectId`, `name` | Rename. |
| `update_project_colors` (admin) | `projectId`, `primaryColor?`, `secondaryColor?` (hex) | Brand colors. |
| `update_default_locale` (admin) | `projectId`, `locale` (e.g. `en`, `es`, `enUS`, `ptBR`) | Date locale. |
| `toggle_text_search` (admin) | `projectId`, `enabled` | Local text search on or off. |
| `toggle_entity_history` (admin) | `projectId`, `enabled` | Entity history on or off. |

## Users

| Tool | Inputs | Does |
|---|---|---|
| `list_users` | `projectId` | Users and roles. |
| `add_user` (admin) | `projectId`, `email`, `roles: ("admin" \| "editor" \| "viewer")[]` | Invite (an existing member's roles are replaced). |
| `update_user_roles` (admin) | `projectId`, `userId`, `roles` | Change roles. |
| `remove_user` (admin) | `projectId`, `userId` | Remove from the project. |

## Resources

| URI | Content |
|---|---|
| `firecms://projects/{projectId}/collections` | Firestore root collections |
| `firecms://projects/{projectId}/users` | Users and roles |
| `firecms://projects/{projectId}/schemas` | All collection schemas |
| `firecms://projects/{projectId}/config` | Project configuration |
