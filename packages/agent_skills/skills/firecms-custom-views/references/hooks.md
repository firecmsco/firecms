# FireCMS hooks reference

Every hook here is exported by `@firecms/core` (source: `packages/firecms_core/src/hooks/`),
and re-exported by `@firecms/cloud`. They only work in components rendered inside `<FireCMS>`:
custom views, entity views, fields, previews, collection actions. Callbacks
(`callbacks.onPreSave`, ...) and entity actions do not run inside a component: they receive the
same controllers in their `context: FireCMSContext` argument.

## useFireCMSContext

```ts
const context = useFireCMSContext();
// context.dataSource            DataSource
// context.storageSource         StorageSource
// context.navigation            NavigationController
// context.sideEntityController  SideEntityController
// context.sideDialogsController SideDialogsController
// context.dialogsController     DialogsController
// context.authController        AuthController
// context.customizationController  (plugins, entityViews, entityActions, propertyConfigs, locale...)
// context.snackbarController    SnackbarController
// context.userConfigPersistence?    UserConfigurationPersistence
// context.analyticsController?  AnalyticsController
// context.userManagement        InternalUserManagement (users list, getUser)
// context.licenseStatus?        PRO license status
```

## useDataSource(collection?)

```ts
const dataSource = useDataSource();

const entities = await dataSource.fetchCollection<Product>({
    path: "products",
    filter: { available: ["==", true] },   // FilterValues
    orderBy: "price",
    order: "asc",
    limit: 20,
    startAfter: undefined,                 // pagination cursor
    searchString: undefined,
    collection: productsCollection         // optional, for property conversion
});

const unsubscribe = dataSource.listenCollection?.<Product>({
    path: "products",
    onUpdate: (entities) => setProducts(entities),
    onError: (e) => console.error(e)
});

const entity = await dataSource.fetchEntity<Product>({ path: "products", entityId: "abc" });
const stop = dataSource.listenEntity?.<Product>({ path: "products", entityId: "abc", onUpdate: setEntity });

const saved = await dataSource.saveEntity<Product>({
    path: "products",
    entityId: "abc",          // omit for a new entity with a generated id
    values: { name: "Lamp", price: 20 },
    status: "existing"        // "new" | "existing" | "copy"
});

await dataSource.deleteEntity({ entity: saved });
const isUnique = await dataSource.checkUniqueField("products", "slug", "lamp", "abc");
const newId = dataSource.generateEntityId("products", productsCollection);
```

`Entity<M>` is `{ id, path, values: M, databaseId?, pathSegments? }`. Passing a `collection` to
`useDataSource(collection)` uses that collection's `overrides.dataSourceDelegate` if it has one.

`saveEntity` / `deleteEntity` skip the collection callbacks. To run them:

```ts
import { saveEntityWithCallbacks, deleteEntityWithCallbacks } from "@firecms/core";

await saveEntityWithCallbacks({
    path: "products",
    entityId: "abc",
    values,
    previousValues,
    status: "existing",
    collection: productsCollection,
    dataSource,
    context,                                // from useFireCMSContext()
    onSaveSuccess: (entity) => {},
    onSaveFailure: (e) => {},
    onPreSaveHookError: (e) => {},
    onSaveSuccessHookError: (e) => {}
});

// collection here is a ResolvedEntityCollection; callbacks are the collection's callbacks
const deleted: boolean = await deleteEntityWithCallbacks({
    entity,
    collection: resolvedCollection,
    callbacks: productsCollection.callbacks,
    dataSource,
    context
});
```

## useCollectionFetch / useEntityFetch

Realtime when the data source supports listening (Firestore does). Callbacks' `onFetch` runs on
the results.

```ts
const { data, dataLoading, noMoreToLoad, dataLoadingError } = useCollectionFetch<Product, User>({
    path: "products",
    collection: productsCollection,        // required
    filterValues: { available: ["==", true] },
    sortBy: ["price", "asc"],
    itemCount: 20,
    searchString: undefined
});

const { entity, dataLoading, dataLoadingError } = useEntityFetch<Product, User>({
    path: "products",
    entityId: "abc",
    collection: productsCollection,        // required
    useCache: false
});
```

## useStorageSource(collection?)

```ts
const storageSource = useStorageSource();
const { path } = await storageSource.uploadFile({ file, fileName: "cover.jpg", path: "images/products" });
const { url } = await storageSource.getDownloadURL(path);   // url is null if not found
const file = await storageSource.getFile(path);              // File | null
await storageSource.deleteFile(path);
const listing = await storageSource.list("images/products", { maxResults: 50 });
```

## useAuthController

```ts
const authController = useAuthController();
authController.user;            // User | null: uid, displayName, email, photoURL, roles?
authController.extra;           // whatever the authenticator stored with setExtra()
authController.setExtra(data);
await authController.getAuthToken();   // Firebase ID token, e.g. for calling your API
await authController.signOut();
authController.authLoading;
```

With the Firebase auth controller, `user` is a `FirebaseUserWrapper` (it also has
`firebaseUser`): `useAuthController<FirebaseUserWrapper>()`.

## useNavigationController

```ts
const navigation = useNavigationController();
navigation.collections;                         // resolved collections
navigation.views;                               // CMSView[]
navigation.getCollection("products");           // by path or id
navigation.navigate("/sales");                  // client-side navigation
navigation.buildUrlCollectionPath("products");  // "/c/products"
navigation.basePath; navigation.baseCollectionPath; navigation.homeUrl;
navigation.refreshNavigation();
```

## useSideEntityController

```ts
const sideEntityController = useSideEntityController();
sideEntityController.open({
    path: "products",
    entityId: "abc",          // omit to create a new entity
    collection,               // optional: otherwise resolved from navigation by path
    copy: false,              // open as a copy
    selectedTab: "preview",   // an entity view key or subcollection id
    width: 900,
    updateUrl: true,
    closeOnSave: false,
    onUpdate: ({ entity }) => {},
    onClose: () => {}
});
sideEntityController.replace({ path: "products", entityId: "def" });
sideEntityController.close();
```

## useSnackbarController

```ts
const snackbarController = useSnackbarController();
snackbarController.open({ type: "success", message: "Saved", autoHideDuration: 3000 });
// type: "success" | "info" | "warning" | "error"; message: React.ReactNode
snackbarController.close();
```

## useDialogsController / useSideDialogsController

```ts
const dialogsController = useDialogsController();
const { closeDialog } = dialogsController.open({
    key: "confirm_publish",
    Component: MyDialog,         // receives { open, closeDialog, ...props }
    props: { count: 3 }
});

const sideDialogsController = useSideDialogsController();
sideDialogsController.open({
    key: "details",
    component: <MyPanel/>,       // a ReactNode
    width: "600px",
    onClose: () => {}
});
sideDialogsController.close("details");
```

Build the dialog body with `Dialog`, `DialogTitle`, `DialogContent`, `DialogActions` from
`@firecms/ui` and the side panel content with `@firecms/ui` components too
(`firecms-ui-components`, `firecms-design-language`).

## useReferenceDialog

```ts
const referenceDialog = useReferenceDialog({
    path: "products",                       // must be a mounted collection (or pass collection)
    multiselect: true,
    maxSelection: 5,
    selectedEntityIds: ["abc"],
    forceFilter: { available: ["==", true] },
    onSingleEntitySelected: (entity) => {},
    onMultipleEntitiesSelected: (entities) => {},
    onClose: () => {}
});
referenceDialog.open();
referenceDialog.close();
```

`ReferenceWidget` (also `@firecms/core`) is the inline version: `<ReferenceWidget path="products"
value={ref} onReferenceSelected={({ reference, entity }) => ...} size="small"/>`.

## useSelectionController

```ts
const selectionController = useSelectionController<Product>();
selectionController.selectedEntities;
selectionController.setSelectedEntities([]);
selectionController.isEntitySelected(entity);
selectionController.toggleEntitySelection(entity);
// <EntityCollectionView {...productsCollection} selectionController={selectionController}/>
```

## Smaller hooks

| Hook | Returns |
|---|---|
| `useModeController()` | `{ mode: "light" \| "dark", setMode(mode: "light" \| "dark" \| "system") }` |
| `useLargeLayout()` | `boolean`, true on wide screens |
| `useClipboard()` | `{ copy(text?), cut(), isCoppied, clipboard, clearClipboard(), isSupported(), ref }` |
| `useBrowserTitleAndIcon(name, logo?)` | Sets the browser tab title and favicon |
| `useTranslation()` | `{ t(key, vars?), i18n }` for FireCMS's built-in strings |
| `useCustomizationController()` | `{ entityViews, entityActions, propertyConfigs, plugins, locale, dateTimeFormat, ... }` |
| `useAnalyticsController()` | `{ onAnalyticsEvent? }` |
| `useInternalUserManagementController()` | The `userManagement` section of the context (users, `getUser`) |
| `useLicenseStatus()` | PRO license status, `null` until known |

## Not hooks, but often needed

| Export | Use |
|---|---|
| `PropertyFieldBinding` | Render a FireCMS field bound to a `FormContext` (secondary forms, composite fields). |
| `PropertyPreview` | Render the default preview of a value. |
| `FieldHelperText` | Description and error under a custom field. |
| `AsyncPreviewComponent` | Render the result of a promise with a skeleton meanwhile. |
| `EntityCollectionView` | A full collection table inside a custom view. |
| `ReferenceWidget` | Inline reference picker. |
| `EntityReference`, `GeoPoint` | Value classes for references and geopoints. |
