---
name: firecms-cloud
description: Work with FireCMS Cloud (app.firecms.co), covering the @firecms/cloud project layout, FireCMSCloudApp and the FireCMSAppConfig, collections edited in the UI versus in code, modifyCollection, Module Federation rules for custom code, deploying with firecms deploy, and the FireCMS MCP server (its tools and the order to call them). Use this skill when a project depends on @firecms/cloud, the user mentions FireCMS Cloud, or you are using the FireCMS MCP tools.
---

# FireCMS Cloud

FireCMS Cloud is the managed edition of FireCMS at [app.firecms.co](https://app.firecms.co). It
connects to the user's **own Firebase project** (their Firestore, Storage and Auth) and serves the
CMS for them: no hosting to run. Collections can be created and edited in the UI (no code), users
and roles are managed in the app, and the plugins that are PRO in self-hosted FireCMS
(collection editor, import/export, entity history, data enhancement, DataTalk) are part of the
hosted app.

Developers extend a Cloud project with **custom code**: a small Vite project whose default export
is a `FireCMSAppConfig`. `firecms deploy` uploads it, and FireCMS Cloud loads it into the hosted
app through Module Federation.

Agents can also drive a Cloud project directly through the **FireCMS MCP server**
(`https://api.firecms.co/mcp`): browse and edit data, create and change collections, infer
schemas from existing data, manage users. See [The FireCMS MCP server](#the-firecms-mcp-server).

Related skills: `firecms-basics` (editions, docs), `firecms-collections` (collection and property
config, the same API in Cloud), `firecms-custom-views` (views, fields, hooks). For any UI, read
`firecms-ui-components` and `firecms-design-language`.

## Is this a Cloud project?

`package.json` has `@firecms/cloud` in dependencies, and `@firecms/cli` plus
`@originjs/vite-plugin-federation` in devDependencies. Scripts: `dev` (`vite --port 5001`),
`build`, `deploy` (`firecms deploy --project=<id>`), `login`, `logout`.

## Project layout (`template_cloud`)

```
src/
  index.tsx            default export: the FireCMSAppConfig. This module is what gets deployed
                       (vite.config.ts exposes "./config" -> "./src/index").
  App.tsx              <FireCMSCloudApp projectId="..." appConfig={appConfig}/>: local dev only
  main.tsx             renders <App/>
  collections/         collections defined in code (demo.tsx)
  entity_views/        entity custom views (SampleEntityView.tsx)
  form_fields/         custom fields (CustomColorTextField.tsx)
  types.ts
vite.config.ts         Module Federation config: shares React, @firecms/* and @firebase/* with
                       the host instead of bundling them
```

```tsx
// src/index.tsx
import React from "react";
import { FireCMSAppConfig } from "@firecms/cloud";
import { demoCollection } from "./collections/demo";
import { SampleEntityView } from "./entity_views/SampleEntityView";

const appConfig: FireCMSAppConfig = {
    version: "2",
    collections: [demoCollection],
    entityViews: [{ key: "sample_entity_view", name: "Sample entity view", Builder: SampleEntityView }]
};

export default appConfig;
```

```tsx
// src/App.tsx (local development)
import React from "react";
import { FireCMSCloudApp } from "@firecms/cloud";
import appConfig from "./index";

export default function App() {
    return <FireCMSCloudApp projectId={"your-firebase-project-id"} appConfig={appConfig}/>;
}
```

`FireCMSCloudApp` props: `projectId` (the Firebase project id), `appConfig`, and optionally
`basePath`, `baseCollectionPath`, `onAnalyticsEvent`.

`npm run dev` serves the app locally on port 5001 against the real FireCMS backend: you sign in
as on app.firecms.co and see the collections already created in the Cloud UI, plus your code.

## `FireCMSAppConfig`

Every field, from `packages/firecms_cloud/src/types/firecms_app_config.tsx`:

| Field | Type | Notes |
|---|---|---|
| `version` | `"1" \| "2"` | Federation contract. `"2"` = React 19 with `react/jsx-runtime` shared (current template). `"1"` = older React 18 bundles. |
| `collections` | `EntityCollection[] \| EntityCollectionsBuilder` | Collections in code. A builder gets `{ user, authController, dataSource }`. |
| `modifyCollection` | `({ collection, parentPaths }) => EntityCollection \| void` | Called for every collection, UI-defined ones included. Add code-only features (callbacks, actions, views, custom fields) to collections edited in the UI. |
| `views` | `CMSView[] \| CMSViewsBuilder` | Top-level custom views. |
| `propertyConfigs` | `PropertyConfig[]` | Reusable property types, selectable in the collection editor; referenced by `propertyConfig: "<key>"`. |
| `entityViews` | `EntityCustomView[]` | Reusable entity tabs, selectable in the collection editor; referenced by key in `entityViews`. |
| `entityActions` | `EntityAction[]` | Reusable entity actions (each with a `key`), referenced by key in a collection's `entityActions`. |
| `HomePage` | `React.ComponentType` | Replace the home page. |
| `fireCMSAppBarComponentProps` | `Partial<DefaultAppBarProps>` | Props for the app bar. |
| `autoOpenDrawer` | `boolean` | Open the drawer on hover (experimental). |
| `firestoreIndexesBuilder` | `FirestoreIndexesBuilder` | Declare composite indexes so users can filter/sort by several fields. |
| `textSearchControllerBuilder` | `FirestoreTextSearchControllerBuilder` | External text search (Algolia, etc.). See `firecms-collections`, Text search. |
| `onFirebaseInit` | `(config: object, app: FirebaseApp) => void` | Called once the project's Firebase app exists: capture `app`, connect emulators. |
| `appCheck` | `AppCheckOptions` | Firebase App Check. |
| `dateTimeFormat` | `string` | Default `"MMMM dd, yyyy, HH:mm:ss"`. |
| `locale` | `Locale` | Date locale. |
| `translations` | `Record<string, Record<string, string>>` | Override UI strings per language. |

Import `FireCMSAppConfig` from `@firecms/cloud` (some doc pages import it from `@firecms/core`,
which does not export it).

## Collections: UI or code

A Cloud project can have both:

- **Collections created in the UI** (collection editor, or the MCP tools) are stored by the
  FireCMS backend, not in the user's Firestore. They are JSON: no functions, so no callbacks,
  custom `Field`/`Preview` components, property builders or `entityActions` with `onClick`.
- **Collections in code** (`collections` in the app config) support everything in
  `firecms-collections`.
- The two lists are **merged by `id`**: a collection with the same `id` in both is deep-merged,
  and the UI definition takes precedence (an enum with two values in code and one extra in the UI
  ends up with three). Set `editable: false` on a code collection (or property) to stop users
  changing it in the editor.
- To add code to a UI collection without redefining it, use `modifyCollection`:

```tsx
import React from "react";
import { FireCMSAppConfig, ArchiveIcon } from "@firecms/cloud";

const appConfig: FireCMSAppConfig = {
    version: "2",
    modifyCollection: ({ collection }) => {
        if (collection.id !== "products") return collection;
        return {
            ...collection,
            callbacks: {
                onPreSave: ({ values }) => ({ ...values, name_lower: values.name?.toLowerCase() })
            },
            entityActions: [{
                key: "archive",
                name: "Archive",
                icon: <ArchiveIcon/>,
                onClick: async ({ entity, context }) => {
                    if (!entity) return;
                    await context.dataSource.saveEntity({
                        path: entity.path, entityId: entity.id,
                        values: { ...entity.values, status: "archived" }, status: "existing"
                    });
                }
            }]
        };
    }
};

export default appConfig;
```

- **Eject a UI collection to code**: in the collection editor, the **Code** button shows the
  collection as TypeScript. Paste it into `src/collections/`, add it to `collections`, deploy.

## Custom code rules (Module Federation)

The hosted app provides React, the FireCMS packages and the Firebase SDK to your bundle; your
build does not include them (`shared` with `generate: false` in `vite.config.ts`). That has
consequences:

1. **Import FireCMS from `@firecms/cloud`.** It re-exports `@firecms/core`, `@firecms/ui` and
   `@firecms/firebase`, so `buildCollection`, `useSnackbarController`, `Button`, `TextField`,
   icons... all come from there.
2. **Import Firebase from `@firebase/*`, not `firebase/*`**: `@firebase/app`,
   `@firebase/firestore`, `@firebase/functions`, `@firebase/auth`, `@firebase/storage`,
   `@firebase/analytics`, `@firebase/remote-config`, `@firebase/app-check`. Only imports that name
   a shared package exactly get the host's copy; `firebase/functions` makes the build point at a
   file it never produces and the app shows **"Error loading remote config"**. The template's
   `vite.config.ts` also aliases `firebase/*` to `@firebase/*`; keep those aliases. With pnpm, add
   the `@firebase/*` packages you import to `package.json`.
3. **Get the Firebase app at run time, not at module top level.** Call `getApp()`,
   `getFirestore()`, `getFunctions()` inside a component or a handler: FireCMS may not have
   initialized the app when your module loads. Or capture it in `onFirebaseInit`.
4. **Never use `getApps()[0]`**: on app.firecms.co that is FireCMS's own backend app, not the
   user's project. Use `getApp()` at run time, the app from `onFirebaseInit`, or
   `getApps().find((a) => a.options.projectId === "<project-id>")`.
5. **Classic JSX runtime**: start every `.tsx` file with `import React from "react";`.
6. **UI**: build from the `@firecms/ui` components (re-exported by `@firecms/cloud`), following
   `firecms-ui-components` and `firecms-design-language`. Use the `surface-*` color tokens with
   their `dark:` pair (`bg-white dark:bg-surface-900`, `border-surface-200
   dark:border-surface-800`); avoid `slate-*` / `gray-*` dark backgrounds, which the host's CSS may
   not include. No other UI library.

Troubleshooting:

- **"Error loading remote config"** with a 404 on `__federation_shared_...`: a shared package
  imported by another path (usually `firebase/...`). With an exception from your code instead:
  something threw while loading, often `getFirestore()` at top level. Missing
  `__federation_shared_*` files in `dist/assets` are expected.
- **404 on `material-icons-....woff2`**: the project's `vite.config.ts` predates the template's
  `experimental.renderBuiltUrl` block. Copy that block from the template, rebuild, redeploy.

## Deploying

```bash
npx firecms login                     # or: npm run login
npm run deploy                        # vite build && firecms deploy --project=<id>
```

**Only deploy when the user asks for it in this conversation**: it replaces the custom code of
the live CMS for everyone on that project. Otherwise, build (`npm run build`) to check the code
and give the user the deploy command. Cloud projects can only be deployed to FireCMS Cloud; a
self-hosted CMS uses the PRO or Community templates instead (same APIs).

## The FireCMS MCP server

One server for everyone, nothing to install:

```
https://api.firecms.co/mcp
```

- Claude (claude.ai, Claude Desktop): Settings, Connectors, Add custom connector, paste the URL.
- Claude Code: `claude mcp add --transport http firecms https://api.firecms.co/mcp`, then `/mcp`
  and Authenticate.
- Cursor and other clients: `{ "mcpServers": { "firecms": { "url": "https://api.firecms.co/mcp" } } }`.

It signs in with the user's FireCMS Cloud account (OAuth in the browser) and can do exactly what
that user can do in FireCMS Cloud. Reads work for any project member; **writes need the `admin`
role** on the project.

A **local** variant runs over stdio (`npx -y @firecms/mcp-server`; Claude Code:
`claude mcp add firecms -- npx -y @firecms/mcp-server`). It signs in with the user's Google
account (`firecms_login`, tokens in `~/.firecms/tokens.json`, shared with the CLI), so it can also
enable Google Cloud APIs, create the Firestore database and connect projects end to end.

### Order of calls

1. **`list_projects` first.** Every other project tool takes a `projectId` from it. If it is
   empty, the user has not connected a Firebase project yet: `connect_project_to_firecms` is the
   way in (hosted: it returns a link to `app.firecms.co/new`; local: it connects the project).
2. **Look before you change**: `list_collection_schemas` / `get_collection_schema` for what the
   CMS shows; `get_root_collections`, `list_subcollections`, `list_documents` for what is in
   Firestore; `get_project_config` for settings.
3. **Then act**, with the narrowest tool: `save_property` for one field, `update_collection_schema`
   for a few top-level fields, `save_collection_schema` only to create or fully replace a
   collection.

### Typical workflows

**Bring an existing Firebase project into FireCMS** (hosted):

1. `list_projects`: if the project is missing, `connect_project_to_firecms` and hand the user the
   link. Firebase Authentication must be enabled in the Firebase console first.
2. `setup_all_collections` (admin): samples each unmapped root collection, infers property types,
   and picks names, icons and groups. Safe to re-run; skips mapped paths and empty paths.
3. If collections do not appear: `apply_firestore_security_rules`, then `setup_all_collections`.

Local server, end to end: `list_firebase_projects` → `get_project_setup_status` (optional) →
`enable_project_apis` (if `apisEnabled` is false) → `enable_firestore` (if `firestoreEnabled` is
false; the location is permanent, so ask) → `connect_project_to_firecms` →
`setup_all_collections`.

**Shape a schema before saving it**: `preview_inferred_schema` (samples up to 200 documents, saves
nothing, works for subcollections) → edit the draft → `save_collection_schema`.

**Create a collection from a description**: `generate_collection` (returns a schema, saves
nothing) → review it → `save_collection_schema`. `modify_collection` does the same for an existing
schema you pass in.

**Add a field**: `get_collection_schema` → `save_property` (new properties go at the end of the
display order; use `namespace` for a field inside a map, e.g. `"address"`).

**Seed or migrate data**: `import_documents` (admin, max 500 per call, `merge` to update instead
of overwrite), `create_document`, `update_document` (merge), `export_collection`.

### Schema format the tools expect

The collection schemas the tools read and write are the JSON form of `EntityCollection` (see
`firecms-collections`), without functions:

```json
{
  "id": "products",
  "path": "products",
  "name": "Products",
  "singularName": "Product",
  "icon": "ShoppingCart",
  "group": "Shop",
  "properties": {
    "name": { "dataType": "string", "name": "Name", "validation": { "required": true } },
    "price": { "dataType": "number", "name": "Price", "validation": { "min": 0 } },
    "status": { "dataType": "string", "name": "Status", "enumValues": [
      { "id": "draft", "label": "Draft" },
      { "id": "published", "label": "Published", "color": "greenLight" }
    ]},
    "cover": { "dataType": "string", "name": "Cover", "storage": { "storagePath": "covers", "acceptedFiles": ["image/*"] } },
    "author": { "dataType": "reference", "name": "Author", "path": "authors" }
  },
  "propertiesOrder": ["name", "price", "status", "cover", "author"]
}
```

Use the array form of `enumValues` (`{ id, label, color? }`). In `list_documents` filters and
document values, dates are `{ _seconds, _nanoseconds }`, references `{ _ref: "collection/docId" }`
and geopoints `{ _lat, _long }`.

### Care with writes

- `delete_document`, `delete_collection_schema`, `delete_property`, `remove_user`,
  `save_collection_schema` (replaces the whole schema), `update_document`, `import_documents`
  without `merge`, and `enable_firestore` (permanent location) change or remove things. Confirm
  with the user first unless they asked for exactly that change.
- `delete_collection_schema` removes the collection from the CMS only; the Firestore data stays.
- Schema tools change what the CMS shows; document tools change the user's live data.
- `list_projects` strips service-account credentials; never ask the user for them.

Full tool list with inputs: [references/mcp-tools.md](references/mcp-tools.md). Docs:
https://firecms.co/docs/cloud/mcp_server.md.

## Docs

- https://firecms.co/docs/cloud/quickstart.md: start a custom-code project.
- https://firecms.co/docs/cloud/app_config.md: the app config.
- https://firecms.co/docs/cloud/deployment.md: deploying and federation troubleshooting.
- https://firecms.co/docs/cloud/eject_collections.md: UI collections to code.
- https://firecms.co/docs/cloud/mcp_server.md: the MCP server.
