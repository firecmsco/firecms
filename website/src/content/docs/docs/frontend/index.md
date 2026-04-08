---
title: Frontend Overview
sidebar_label: Frontend
slug: docs/frontend
description: Build and customize the Rebase admin panel with React — controllers, scaffold, routing, and views.
---

## Overview

The Rebase frontend is a **React framework** that renders your admin panel. It reads your collection definitions and generates tables, forms, navigation, and routing automatically.

The key components that make up a Rebase frontend:

```tsx
<Rebase
    client={rebaseClient}
    collectionRegistryController={collectionRegistryController}
    cmsUrlController={cmsUrlController}
    navigationStateController={navigationStateController}
    authController={authController}
>
    {({ loading }) => (
        <Scaffold>
            <AppBar />
            <Drawer title="My App" />
            <Outlet />
            <SideDialogs />
        </Scaffold>
    )}
</Rebase>
```

## The Rebase Provider

`<Rebase>` is the root provider that makes all Rebase functionality available to child components via context. It accepts:

| Prop | Description |
|------|-------------|
| `client` | `RebaseClient` instance for data, auth, and storage |
| `collectionRegistryController` | Resolves collection paths and configurations |
| `cmsUrlController` | Builds URLs and handles routing |
| `navigationStateController` | Manages navigation state, views, and plugins |
| `authController` | Authentication state and methods |
| `storageSource` | File storage operations |
| `userConfigPersistence` | Local UI preferences (column widths, etc.) |
| `entityViews` | Global custom entity view tabs |
| `entityActions` | Global entity actions |
| `plugins` | Plugin instances (legacy prop — prefer passing via navigation controller) |

## Controllers

Controllers are React hooks that configure specific aspects of the framework:

### `useBuildNavigationStateController`

The main controller that wires everything together:

```typescript
const navigationStateController = useBuildNavigationStateController({
    collections: () => [...collections],  // Collection definitions
    views: customViews,                   // Custom navigation views
    plugins,                              // Plugin instances
    authController,
    data: rebaseClient.data,
    collectionRegistryController,
    cmsUrlController,
    adminMode: adminModeController.mode,
    userManagement
});
```

### `useBuildCollectionRegistryController`

Manages how collections are resolved from URL paths:

```typescript
const collectionRegistryController = useBuildCollectionRegistryController({
    userConfigPersistence
});
```

### `useBuildCMSUrlController`

Configures URL generation:

```typescript
const cmsUrlController = useBuildCMSUrlController({
    basePath: "/",
    baseCollectionPath: "/c",
    collectionRegistryController
});
```

### `useBuildModeController`

Manages light/dark theme:

```typescript
const modeController = useBuildModeController();
// Provides: modeController.mode ("light" | "dark"), modeController.toggleMode()
```

### `useBuildAdminModeController`

Toggles between Studio and Content modes:

```typescript
const adminModeController = useBuildAdminModeController();
// Provides: adminModeController.mode ("studio" | "content")
```

## Scaffold Components

| Component | Description |
|-----------|-------------|
| `<Scaffold>` | Main layout container with responsive sidebar |
| `<AppBar>` | Top navigation bar with search, mode toggle, user menu |
| `<Drawer>` | Side navigation with collection list and view links |
| `<SideDialogs>` | Container for side panel entity editors |
| `<RebaseRoutes>` | Route container that integrates with React Router |
| `<RebaseRoute>` | Handles collection routes (`/c/*`) |
| `<ContentHomePage>` | Default home page showing collection cards |
| `<StudioHomePage>` | Studio mode home page with developer tools |

## Custom Views

Add top-level navigation views for dashboards, tools, or custom pages:

```typescript
const views: CMSView[] = [
    {
        slug: "dashboard",
        name: "Dashboard",
        icon: "dashboard",
        group: "Analytics",
        view: <MyDashboard />
    },
    {
        slug: "settings",
        name: "App Settings",
        icon: "settings",
        view: <AppSettings />,
        nestedRoutes: true  // Support sub-paths
    }
];
```

## Styling

Rebase uses **Tailwind CSS v4** and supports light/dark modes. Customize via:

- **CSS custom properties** — Override design tokens
- **`ModeControllerProvider`** — Control light/dark mode
- **Tailwind config** — Standard Tailwind customization

```css
/* Override design tokens */
:root {
    --font-sans: "Inter", sans-serif;
    --font-mono: "JetBrains Mono", monospace;
}
```

## Next Steps

- **[Custom Fields](/docs/frontend/custom-fields)** — Build custom form fields
- **[Entity Views](/docs/frontend/entity-views)** — Add tabs to entity editors
- **[View Modes](/docs/frontend/view-modes)** — Table, Cards, Kanban
- **[Plugins](/docs/plugins)** — Extend the framework
