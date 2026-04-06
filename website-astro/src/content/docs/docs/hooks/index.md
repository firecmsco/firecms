---
title: Hooks Reference
sidebar_label: Hooks
slug: docs/hooks
description: React hooks provided by Rebase for accessing auth, data, navigation, side panels, storage, and UI state.
---

## Overview

Rebase provides React hooks to access framework functionality from any component within the `<Rebase>` provider tree.

## `useRebaseContext`

The master hook — access everything:

```typescript
import { useRebaseContext } from "@rebasepro/core";

function MyComponent() {
    const context = useRebaseContext();

    context.dataSource          // Data operations
    context.storageSource       // File operations
    context.authController      // Auth state
    context.navigation          // Navigation state
    context.sideEntityController // Side panel control
    context.snackbarController  // Toast notifications
}
```

## `useAuthController`

Access authentication state:

```typescript
import { useAuthController } from "@rebasepro/core";

function UserMenu() {
    const auth = useAuthController();

    auth.user            // Current user (or null)
    auth.initialLoading  // Loading initial session
    auth.signOut()       // Log out
    auth.getAuthToken()  // Get JWT for API calls
    auth.extra           // Additional user data (roles, etc.)
}
```

## `useSideEntityController`

Programmatically open entities in a side panel:

```typescript
import { useSideEntityController } from "@rebasepro/core";

function OpenProductButton({ productId }) {
    const sideEntityController = useSideEntityController();

    return (
        <button onClick={() => {
            sideEntityController.open({
                path: "products",
                entityId: productId,
                collection: productsCollection
            });
        }}>
            Open Product
        </button>
    );
}
```

Methods:

| Method | Description |
|--------|-------------|
| `open({ path, entityId, collection })` | Open an entity in a side panel |
| `close()` | Close the current side panel |
| `replace({ path, entityId, collection })` | Replace the current side panel content |

## `useSnackbarController`

Show toast notifications:

```typescript
import { useSnackbarController } from "@rebasepro/core";

function SaveButton() {
    const snackbar = useSnackbarController();

    const handleSave = async () => {
        try {
            await saveData();
            snackbar.open({ type: "success", message: "Saved successfully!" });
        } catch (error) {
            snackbar.open({ type: "error", message: "Save failed" });
        }
    };
}
```

## `useStorageSource`

Access file storage operations:

```typescript
import { useStorageSource } from "@rebasepro/core";

function FileUploader() {
    const storage = useStorageSource();

    const upload = async (file: File) => {
        const result = await storage.uploadFile({
            file,
            fileName: file.name,
            path: "documents"
        });
        const url = await storage.getDownloadURL(result.path);
        return url;
    };
}
```

## `useModeController`

Control light/dark theme:

```typescript
import { useModeController } from "@rebasepro/core";

function ThemeToggle() {
    const mode = useModeController();

    return (
        <button onClick={mode.toggleMode}>
            Current: {mode.mode} {/* "light" | "dark" */}
        </button>
    );
}
```

## `useReferenceDialog`

Open a reference selection dialog:

```typescript
import { useReferenceDialog } from "@rebasepro/core";

function SelectProduct() {
    const referenceDialog = useReferenceDialog({
        path: "products",
        collection: productsCollection,
        onSingleEntitySelected: (entity) => {
            console.log("Selected:", entity);
        }
    });

    return <button onClick={referenceDialog.open}>Select Product</button>;
}
```

## `useNavigationController`

Access navigation state and resolved collections:

```typescript
import { useNavigationController } from "@rebasepro/core";

function MyComponent() {
    const navigation = useNavigationController();

    navigation.collections     // All registered collections
    navigation.views           // Custom views
    navigation.adminViews      // Admin-mode views
    navigation.getCollection(path) // Get collection for a path
}
```

## Next Steps

- **[Frontend Overview](/docs/frontend)** — React framework reference
- **[Client SDK](/docs/sdk)** — Data operations SDK
