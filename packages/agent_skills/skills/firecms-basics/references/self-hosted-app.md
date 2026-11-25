# Wiring a self-hosted FireCMS app (Community and PRO)

This is the shape of `src/App.tsx` in the `template` (Community) and `template_pro` (PRO) CLI
templates. Every name below is exported by the package shown.

## The pieces

| Piece | From | What it does |
|---|---|---|
| `useInitialiseFirebase({ firebaseConfig, onFirebaseInit?, name?, authDomain? })` | `@firecms/firebase` | Initialises the Firebase app. Returns `{ firebaseApp, firebaseConfigLoading, configError }`. |
| `useFirebaseAuthController({ firebaseApp, signInOptions, defineRolesFor?, onSignOut? })` | `@firecms/firebase` | The `FirebaseAuthController`: `user`, `signOut()`, `googleLogin()`, `emailPasswordLogin()`, `setExtra()`... |
| `useFirestoreDelegate({ firebaseApp, localTextSearchEnabled?, textSearchControllerBuilder?, firestoreIndexesBuilder? })` | `@firecms/firebase` | Reads and writes Firestore. See `firecms-collections` for the text search options. |
| `useFirebaseStorageSource({ firebaseApp })` | `@firecms/firebase` | Uploads and downloads files in Firebase Storage. |
| `useBuildModeController()` + `<ModeControllerProvider value={...}>` | `@firecms/core` | Light/dark mode. |
| `useBuildLocalConfigurationPersistence()` | `@firecms/core` | Stores per-user UI preferences (column widths, etc.) in local storage. |
| `useValidateAuthenticator({ authController, authenticator, dataSourceDelegate, storageSource, disabled? })` | `@firecms/core` | Runs your `Authenticator`. Returns `{ authLoading, canAccessMainView, notAllowedError }`. |
| `useBuildNavigationController({ collections, views?, adminViews?, plugins?, collectionPermissions?, navigationGroupMappings?, basePath?, baseCollectionPath?, authController, dataSourceDelegate, disabled? })` | `@firecms/core` | Builds navigation and routes. `collections` and `views` take an array or an async builder `({ user, authController, dataSource }) => [...]`. |
| `<FireCMS navigationController authController dataSourceDelegate storageSource userConfigPersistence? apiKey? plugins? entityViews? entityActions? propertyConfigs? dateTimeFormat? locale?>` | `@firecms/core` | The root provider. Its child is a function `({ context, loading }) => ReactNode`. |
| `<Scaffold>`, `<AppBar title>`, `<Drawer/>`, `<NavigationRoutes/>`, `<SideDialogs/>` | `@firecms/core` | The app shell, rendered once the user can access the main view. |
| `<FirebaseLoginView firebaseApp authController signInOptions notAllowedError? allowSkipLogin? logo?>` | `@firecms/firebase` | The login screen. |
| `<FireCMSi18nProvider>`, `<SnackbarProvider>` | `@firecms/core` | Wrap the tree, outside `<FireCMS>`. |
| `<CircularProgressCenter/>` | `@firecms/core` | Full-page spinner while loading. |

`signInOptions` is an array of `FirebaseSignInProvider` (`"password"`, `"google.com"`,
`"phone"`, `"anonymous"`, `"facebook.com"`, `"github.com"`, `"twitter.com"`, `"microsoft.com"`,
`"apple.com"`) or `FirebaseSignInOption` objects (`{ provider, scopes?, customParameters? }`).
Each provider must also be enabled in the Firebase console (Authentication, Sign-in method).

## Minimal skeleton

```tsx
import React, { useMemo } from "react";
import {
    AppBar, CircularProgressCenter, Drawer, FireCMS, FireCMSi18nProvider,
    ModeControllerProvider, NavigationRoutes, Scaffold, SideDialogs, SnackbarProvider,
    useBuildLocalConfigurationPersistence, useBuildModeController,
    useBuildNavigationController, useValidateAuthenticator
} from "@firecms/core";
import {
    FirebaseAuthController, FirebaseLoginView, FirebaseSignInProvider, useFirebaseAuthController,
    useFirebaseStorageSource, useFirestoreDelegate, useInitialiseFirebase
} from "@firecms/firebase";
import { firebaseConfig } from "./firebase_config";
import { productsCollection } from "./collections/products";
import { myAuthenticator } from "./authenticator";

const signInOptions: FirebaseSignInProvider[] = ["google.com", "password"];

export default function App() {
    const { firebaseApp, firebaseConfigLoading, configError } = useInitialiseFirebase({ firebaseConfig });
    const modeController = useBuildModeController();
    // Annotate the type: it makes the user a FirebaseUserWrapper, which an
    // Authenticator<FirebaseUserWrapper> needs.
    const authController: FirebaseAuthController = useFirebaseAuthController({ firebaseApp, signInOptions });
    const userConfigPersistence = useBuildLocalConfigurationPersistence();
    const firestoreDelegate = useFirestoreDelegate({ firebaseApp });
    const storageSource = useFirebaseStorageSource({ firebaseApp });

    const { authLoading, canAccessMainView, notAllowedError } = useValidateAuthenticator({
        authController,
        authenticator: myAuthenticator,
        dataSourceDelegate: firestoreDelegate,
        storageSource
    });

    const collections = useMemo(() => [productsCollection], []);
    const navigationController = useBuildNavigationController({
        disabled: authLoading,
        collections,
        authController,
        dataSourceDelegate: firestoreDelegate
    });

    if (firebaseConfigLoading || !firebaseApp) return <CircularProgressCenter/>;
    if (configError) return <>{configError}</>;

    return (
        <FireCMSi18nProvider>
            <SnackbarProvider>
                <ModeControllerProvider value={modeController}>
                    <FireCMS navigationController={navigationController}
                             authController={authController}
                             userConfigPersistence={userConfigPersistence}
                             dataSourceDelegate={firestoreDelegate}
                             storageSource={storageSource}>
                        {({ loading }) => {
                            if (loading || authLoading) return <CircularProgressCenter size={"large"}/>;
                            if (!canAccessMainView)
                                return <FirebaseLoginView authController={authController}
                                                          firebaseApp={firebaseApp}
                                                          signInOptions={signInOptions}
                                                          notAllowedError={notAllowedError}/>;
                            return <Scaffold autoOpenDrawer={false}>
                                <AppBar title={"My CMS"}/>
                                <Drawer/>
                                <NavigationRoutes/>
                                <SideDialogs/>
                            </Scaffold>;
                        }}
                    </FireCMS>
                </ModeControllerProvider>
            </SnackbarProvider>
        </FireCMSi18nProvider>
    );
}
```

`main.tsx` wraps `<App/>` in `<BrowserRouter basename={"/"}>` (react-router-dom 6). FireCMS uses
React Router for its routes: do not add a second router inside the app.

## PRO additions

In `template_pro/src/App.tsx`:

```tsx
import { useBuildUserManagement, userManagementAdminViews, useUserManagementPlugin } from "@firecms/user_management";
import { useImportPlugin } from "@firecms/data_import";
import { useExportPlugin } from "@firecms/data_export";
import { useEntityHistoryPlugin } from "@firecms/entity_history";
import { useDataEnhancementPlugin } from "@firecms/data_enhancement";
import { mergeCollections, useCollectionEditorPlugin } from "@firecms/collection_editor";
import { buildCollectionInference, useFirestoreCollectionsConfigController } from "@firecms/collection_editor_firebase";
```

- `useBuildUserManagement({ authController, dataSourceDelegate })` returns a controller that is
  used as the `authController` everywhere else, provides `authenticator` and
  `collectionPermissions`, and `getUser` for entity history.
- `useFirestoreCollectionsConfigController({ firebaseApp })` stores collections edited in the UI;
  `mergeCollections(codeCollections, collectionConfigController.collections ?? [])` merges them
  with the ones in code, inside the `collections` builder.
- Plugins go in `useBuildNavigationController({ plugins: [...] })`, with
  `adminViews: userManagementAdminViews` and
  `collectionPermissions: userManagementController.collectionPermissions`.
- `<FireCMS apiKey={import.meta.env.VITE_FIRECMS_API_KEY} ...>` carries the license key.

Each plugin's docs: https://firecms.co/docs/pro/user_management.md,
https://firecms.co/docs/pro/collection_editor.md, https://firecms.co/docs/pro/entity_history.md,
https://firecms.co/docs/pro/data_import.md, https://firecms.co/docs/pro/data_export.md.
