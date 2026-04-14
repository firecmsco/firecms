---
name: rebase-studio
description: Guide for using and customizing the Rebase Studio admin panel. Use this skill when the user needs help with the visual collection editor, custom views, dev/editor mode toggle, or Studio configuration.
---

# Rebase Studio

Rebase Studio is the visual admin panel that provides a complete CMS experience — spreadsheet views, form editing, visual schema editor, user management, and more.

## Overview

The Studio is built on `@rebasepro/core` and provides:
- **Spreadsheet-style collection views** with inline editing
- **Visual schema editor** for non-developers
- **Form views** with 20+ field types
- **Card grid** and **Kanban board** view modes
- **User management** with role-based access
- **Data import/export** (CSV, JSON, Excel)
- **Entity history** and audit trail
- **Custom views** as React components
- **Rich text editor** (TipTap-based, Notion-style)

## Dev Mode & Editor Mode

The Studio has two modes controlled by `AdminModeController`:

### Developer Mode (`mode === "developer"`)
- Full access to collection editor, schema management
- "Edit Schema" inline actions on views
- Debug tools and developer-specific UI
- Can simulate different roles via **Effective Role Controller**

### Editor Mode (`mode === "editor"`)
- Clean end-user experience
- No developer-specific UI elements
- Shows exactly what end-users see

**Important:** This toggle must always be preserved. Developers use it to preview the exact end-user experience.

## Effective Role Simulation

In Dev Mode, developers can select an "effective role" to preview the application as a specific role would see it:

```typescript
// The EffectiveRoleController context provides:
const { effectiveRole, setEffectiveRole } = useEffectiveRole();
```

When toggled to Editor Mode with an effective role set, the developer sees exactly what that role can access.

## Visual Collection Editor

The Studio's collection editor allows non-developers to:
- Add, remove, and reorder fields
- Configure field types and validation
- Set up enum values and references
- Preview the form layout

Under the hood, it uses **AST manipulation** (via `ts-morph`) to modify the TypeScript collection files — preserving all custom callbacks and code.

## Custom Views

Add custom React views to the Studio navigation:

```typescript
import { EntityCollection } from "@rebasepro/core";

const myCustomView = {
    path: "dashboard",
    name: "Dashboard",
    view: <DashboardView />,
};
```

### Useful Hooks

| Hook | Description |
|------|-------------|
| `useSideEntityController()` | Open/close entity side panels |
| `useSnackbarController()` | Show toast notifications |
| `useAuthController()` | Access current user and auth state |
| `useNavigationController()` | Navigate between views |
| `useDataSource()` | Access the data source for CRUD ops |

## Key Packages

| Package | Description |
|---------|-------------|
| `@rebasepro/core` | Core framework, hooks, types |
| `@rebasepro/studio` | Studio admin panel components |
| `@rebasepro/cms` | CMS frontend application |
| `@rebasepro/plugin-data-enhancement` | AI-powered autofill |
| `@rebasepro/schema-inference` | Auto-infer schema from data |

## Running the Studio

```bash
# From the repo root
cd app
pnpm run dev
```

This starts both frontend and backend. The Studio is accessible at `http://localhost:5173` (Vite default).

## References

- **Custom Views:** See [references/custom-views.md](references/custom-views.md) for building custom views.
- **Collection Editor:** See [references/collection-editor.md](references/collection-editor.md) for the visual schema editor API.
- **Studio Hooks:** See [references/studio-hooks.md](references/studio-hooks.md) for all available hooks.
