---
title: Studio Tools
sidebar_label: Studio
slug: docs/studio
description: Rebase Studio provides developer tools for visual schema editing, SQL queries, JavaScript scripting, RLS policy management, and storage browsing.
---

## Overview

Rebase has two modes:

- **Content Mode** — For content editors and operations teams. Shows collections and data management.
- **Studio Mode** — For developers. Unlocks developer-facing tools.

Toggle between modes using the admin mode controller or the UI toggle in the app bar.

## Built-in Studio Tools

### Collection Editor

A visual schema editor that lets you create and modify collections through a drag-and-drop UI. When you save changes, it uses [ts-morph](https://ts-morph.com/) to update your TypeScript source files via AST manipulation — preserving all existing code and custom logic.

![Collection editor](/img/collection_editor.png)

```tsx
import { CollectionsStudioView, useLocalCollectionsConfigController } from "@rebasepro/studio";

const configController = useLocalCollectionsConfigController(client, collections, {
    getAuthToken: authController.getAuthToken
});

// Add as a custom view
{
    slug: "schema",
    name: "Edit Collections",
    view: <CollectionsStudioView configController={configController} />
}
```

### SQL Console

Run raw SQL queries against your PostgreSQL database and see results in a table:

```tsx
import { SQLEditor } from "@rebasepro/studio";

{ slug: "sql", name: "SQL Console", view: <SQLEditor /> }
```

### JS Console

Write and execute JavaScript using the Rebase SDK:

```tsx
import { JSEditor } from "@rebasepro/studio";

{ slug: "js", name: "JS Console", view: <JSEditor /> }
```

### RLS Policy Editor

Visualize and manage Row Level Security policies for your PostgreSQL tables:

```tsx
import { RLSEditor } from "@rebasepro/studio";

{ slug: "rls", name: "RLS Policies", view: <RLSEditor /> }
```

### Storage Browser

Browse, upload, and manage files in your storage backends:

```tsx
import { StorageView } from "@rebasepro/studio";

{ slug: "storage", name: "Storage", view: <StorageView /> }
```

## Adding Studio Views

Add studio tools as custom views in your `App.tsx`:

```typescript
const devViews: CMSView[] = [
    {
        slug: "sql",
        name: "SQL Console",
        group: "Database",
        icon: "terminal",
        view: <SQLEditor />
    },
    {
        slug: "rls",
        name: "RLS Policies",
        group: "Database",
        icon: "security",
        view: <RLSEditor />
    },
    {
        slug: "schema",
        name: "Edit Collections",
        group: "Schema",
        icon: "view_list",
        nestedRoutes: true,
        view: <CollectionsStudioView configController={configController} />
    },
    {
        slug: "storage",
        name: "Storage",
        group: "Storage",
        icon: "cloud",
        view: <StorageView />
    }
];
```

These views appear in the sidebar navigation when Studio mode is active.

## Next Steps

- **[Plugins](/docs/plugins)** — Extend the framework with plugins
- **[Collections](/docs/collections)** — Collection configuration
