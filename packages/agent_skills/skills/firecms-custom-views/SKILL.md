---
name: firecms-custom-views
description: Build custom React UI inside FireCMS, covering top-level views (CMSView), entity custom views (EntityCustomView tabs), custom form fields (FieldProps / Field), custom previews, additional columns, collection toolbar actions, and the FireCMS hooks they use (useDataSource, useSideEntityController, useSnackbarController, useAuthController and more). Use this skill when you add a page, dashboard, tab, field, preview or button to a FireCMS app.
---

# FireCMS custom views and fields

FireCMS is a React app, so every customization is a React component placed in a slot FireCMS
gives you. Pick the slot first, then write the component with **`@firecms/ui`** and the FireCMS
hooks.

## UI rule: build with `@firecms/ui`, nothing else

Every example in this skill builds its UI from `@firecms/ui` (`Container`, `Card`, `Paper`,
`Typography`, `Button`, `TextField`, `Chip`, `Alert`, `Dialog`, icons such as `AddIcon`...).
Do the same:

- **Never** write layouts with raw `<div style={{...}}>`, never import MUI (`@mui/*`), Chakra,
  Ant, shadcn copies, `lucide-react` or `react-icons`. FireCMS dropped MUI in 3.0.
- Text goes through `Typography`; inputs are `TextField`, `Select`, `BooleanSwitchWithLabel`...;
  colors use the theme tokens (`surface-*`, `primary`) with their `dark:` pair, never hex values.
- **Before writing any view, read `firecms-ui-components`** (every component and its props) and
  **`firecms-design-language`** (page widths, headings, spacing, empty/loading/error states, and
  copy-paste skeletons for list, settings and dashboard pages). A custom view should be
  impossible to tell apart from a built-in one.

In a **FireCMS Cloud** project, import everything (`@firecms/core`, `@firecms/ui`,
`@firecms/firebase` names) from `@firecms/cloud`, and start every `.tsx` file with
`import React from "react";` (the Cloud build uses the classic JSX runtime). See `firecms-cloud`.

## Which slot

| You want | Slot | Type |
|---|---|---|
| A page in the main navigation (dashboard, report, tool) | `views` of the navigation | `CMSView` |
| A page under the admin menu | `adminViews` of `useBuildNavigationController` | `CMSView` |
| A tab next to an entity's form (preview, secondary form, related data) | collection `entityViews` | `EntityCustomView` |
| A different editor for one property | property `Field` | `React.ComponentType<FieldProps>` |
| A different read-only rendering of one property (table cell, references) | property `Preview` | `React.ComponentType<PropertyPreviewProps>` |
| A computed column | collection `additionalFields` | `AdditionalFieldDelegate` |
| Buttons in the collection toolbar (bulk actions, custom filters) | collection `Actions` | `React.ComponentType<CollectionActionsProps>` |
| An action on one entity (row menu and form) | collection `entityActions` | `EntityAction` (see `firecms-collections`) |

All the types and hooks below are exported by `@firecms/core`.

## Top-level views (`CMSView`)

```ts
interface CMSView {
    path: string;                 // URL path under the CMS base path, e.g. "sales" -> /sales
    name: string;                 // navigation label
    view: React.ReactNode;        // the element to render, e.g. <SalesView/>
    description?: string;         // markdown, shown on the home page card
    icon?: string | React.ReactNode;   // Material icon key, e.g. "bar_chart"
    group?: string;               // navigation group (ignored for admin views)
    hideFromNavigation?: boolean; // reachable by URL only
}
```

Register it. **Self-hosted** (Community, PRO), in `src/App.tsx`:

```tsx
import { CMSView, useBuildNavigationController } from "@firecms/core";
import { SalesView } from "./views/SalesView";

const views: CMSView[] = useMemo(() => [{
    path: "sales",
    name: "Sales",
    icon: "bar_chart",
    description: "Orders and revenue for the last 30 days",
    view: <SalesView/>
}], []);

const navigationController = useBuildNavigationController({
    collections,
    views,                // or ({ user, authController, dataSource }) => user ? views : []
    authController,
    dataSourceDelegate: firestoreDelegate
});
```

**Cloud**: `views: [...]` (or a builder) in the `FireCMSAppConfig` default-exported from
`src/index.tsx`.

A view, built from `@firecms/ui` and reading Firestore through the data source:

```tsx
import React, { useEffect, useState } from "react";
import { Entity, useDataSource, useSideEntityController, useSnackbarController } from "@firecms/core";
import { Button, Card, CircularProgress, Container, OpenInNewIcon, Typography } from "@firecms/ui";

type Order = { customer: string; total: number; status: string };

export function SalesView() {
    const dataSource = useDataSource();
    const sideEntityController = useSideEntityController();
    const snackbarController = useSnackbarController();
    const [orders, setOrders] = useState<Entity<Order>[] | null>(null);

    useEffect(() => {
        // Filtering on one field and sorting on another needs a Firestore composite index,
        // so this only filters. Add orderBy/order once the index exists.
        dataSource.fetchCollection<Order>({
            path: "orders",
            filter: { status: ["==", "paid"] },
            limit: 10
        })
            .then(setOrders)
            .catch((e: Error) => snackbarController.open({ type: "error", message: e.message }));
    }, [dataSource]);

    const revenue = (orders ?? []).reduce((sum, o) => sum + (o.values.total ?? 0), 0);

    return (
        <Container maxWidth={"6xl"} className={"py-8 flex flex-col gap-6"}>
            <Typography variant={"h4"}>Sales</Typography>

            <Card className={"p-6"}>
                <Typography variant={"caption"} color={"secondary"}>Revenue of 10 paid orders</Typography>
                <Typography variant={"h3"}>{revenue.toFixed(2)} €</Typography>
            </Card>

            {orders === null
                ? <CircularProgress/>
                : orders.map((order) => (
                    <Card key={order.id} className={"p-4 flex flex-row items-center gap-4"}>
                        <Typography className={"flex-grow"}>{order.values.customer}</Typography>
                        <Typography variant={"body2"}>{order.values.total} €</Typography>
                        <Button variant={"text"}
                                onClick={() => sideEntityController.open({ path: "orders", entityId: order.id })}>
                            <OpenInNewIcon size={"small"}/>
                            Open
                        </Button>
                    </Card>
                ))}
        </Container>
    );
}
```

For realtime data use `dataSource.listenCollection` (returns an unsubscribe function) or the
`useCollectionFetch` hook. A view can also embed a full collection table:

```tsx
import { EntityCollectionView, useSelectionController } from "@firecms/core";
import { Paper } from "@firecms/ui";

const selectionController = useSelectionController();
// ...
<Paper className={"h-[480px]"}>
    <EntityCollectionView {...productsCollection} selectionController={selectionController}/>
</Paper>
```

## Entity custom views (`EntityCustomView`)

A tab in the entity view, next to the form. It sees the saved entity and the **unsaved** form
values, and can edit the form.

```ts
type EntityCustomView<M> = {
    key: string;                       // also usable in viewGroups / defaultSelectedView
    name: string;                      // tab label
    Builder?: React.ComponentType<EntityCustomViewParams<M>>;
    tabComponent?: React.ReactNode;    // render this in the tab instead of the name
    includeActions?: boolean | "bottom";   // show save/discard/delete in this tab
    position?: "start" | "end";        // default "end"
};

interface EntityCustomViewParams<M> {
    collection: EntityCollection<M>;
    entity?: Entity<M>;                // undefined for a new entity
    modifiedValues?: EntityValues<M>;  // current form values, saved or not
    formContext: FormContext;          // setFieldValue, values, save, status...
    parentCollectionIds?: string[];
}
```

A live preview of the form values:

```tsx
import React from "react";
import { EntityCustomViewParams } from "@firecms/core";
import { CenteredView, Chip, Container, Markdown, Typography } from "@firecms/ui";
import { BlogEntry } from "../types";

export function BlogEntryPreview({ modifiedValues }: EntityCustomViewParams<BlogEntry>) {
    if (!modifiedValues?.title)
        return <CenteredView>
            <Typography color={"secondary"}>Add a title to see the preview</Typography>
        </CenteredView>;

    return (
        <Container maxWidth={"3xl"} className={"py-12 flex flex-col gap-4"}>
            <Chip size={"small"}>{modifiedValues.status}</Chip>
            <Typography variant={"h3"}>{modifiedValues.title}</Typography>
            <Markdown source={modifiedValues.body ?? ""}/>
        </Container>
    );
}
```

A secondary form: `PropertyFieldBinding` renders a regular FireCMS field bound to the same form,
so the value is validated and saved with the entity.

```tsx
import React from "react";
import { EntityCustomViewParams, PropertyFieldBinding } from "@firecms/core";
import { Container, Typography } from "@firecms/ui";

export function SeoForm({ formContext }: EntityCustomViewParams) {
    return (
        <Container maxWidth={"3xl"} className={"py-8 flex flex-col gap-4"}>
            <Typography variant={"h5"}>SEO</Typography>
            <PropertyFieldBinding context={formContext}
                                  propertyKey={"seo"}
                                  property={{
                                      dataType: "map",
                                      name: "SEO",
                                      properties: {
                                          title: { dataType: "string", name: "Meta title", validation: { max: 60 } },
                                          description: { dataType: "string", name: "Meta description", multiline: true }
                                      }
                                  }}/>
        </Container>
    );
}
```

Attach to a collection:

```tsx
entityViews: [
    { key: "preview", name: "Preview", Builder: BlogEntryPreview },
    { key: "seo", name: "SEO", includeActions: true, Builder: SeoForm }
],
viewGroups: [{ name: "More", views: ["preview", "seo"] }],   // optional: group tabs in a dropdown
defaultSelectedView: "preview",                               // optional: open this tab first
```

To reuse a view in several collections, register it once and reference it by key
(`entityViews: ["preview"]`): self-hosted `<FireCMS entityViews={[...]}>`, Cloud `entityViews`
in the app config. Registered views can also be picked in the collection editor.

## Custom fields (`Field` + `FieldProps`)

Set `Field` on a property. The component receives `FieldProps<T, CustomProps>`:

| Prop | Meaning |
|---|---|
| `value: T` | Current value (may be `undefined` or `null`). |
| `setValue(value, shouldValidate?)` | Update this field. Never mutate `value`. |
| `setFieldValue(key, value, shouldValidate?)` | Update another field, e.g. `"address.street"`. |
| `propertyKey`, `property` | This property's key and (resolved) config. |
| `error`, `showError`, `touched` | Validation state; show `error` only when `showError`. |
| `isSubmitting`, `disabled` | Disable input while true. |
| `includeDescription` | Render the description. |
| `customProps` | The property's `customProps`, typed by the second generic. |
| `context: FormContext` | `values`, `setFieldValue`, `save`, `entityId`, `status`, `collection`, `path`, `disabled`, `openEntityMode`, `formex`. |
| `partOfArray`, `partOfBlock`, `minimalistView`, `autoFocus`, `size` | Layout hints. |

```tsx
import React from "react";
import { FieldHelperText, FieldProps } from "@firecms/core";
import { TextField } from "@firecms/ui";

type SlugFieldProps = { sourceKey: string };

export function SlugField({
                              property, value, setValue, context, customProps,
                              error, showError, isSubmitting, disabled, includeDescription
                          }: FieldProps<string, SlugFieldProps>) {

    const source = context.values[customProps.sourceKey];

    React.useEffect(() => {
        if (!value && typeof source === "string" && source) {
            setValue(source.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
        }
    }, [source]);

    return (
        <>
            <TextField label={property.name}
                       value={value ?? ""}
                       error={showError && Boolean(error)}
                       disabled={disabled || isSubmitting}
                       onChange={(e) => setValue(e.target.value)}/>
            <FieldHelperText includeDescription={includeDescription}
                             showError={showError}
                             error={error}
                             property={property}/>
        </>
    );
}

// In the collection:
// slug: {
//     dataType: "string",
//     name: "Slug",
//     validation: { required: true, matches: /^[a-z0-9-]+$/ },
//     Field: SlugField,
//     customProps: { sourceKey: "title" }
// }
```

Keep validation declarative (`validation` on the property) and let FireCMS show the error. To
compose existing fields inside a custom one, render `<PropertyFieldBinding propertyKey context
property/>` for each child. Before writing a custom field, check that no property option already
does it (see `firecms-collections`: `multiline`, `markdown`, `enumValues`, `url`, `userSelect`,
`keyValue`, storage uploads).

## Custom previews (`Preview` + `PropertyPreviewProps`)

How a value renders in the table, in references and in read-only fields:

```tsx
import React from "react";
import { PropertyPreviewProps } from "@firecms/core";
import { Chip, Typography } from "@firecms/ui";

export function PricePreview({ value, size }: PropertyPreviewProps<number>) {
    if (value === undefined || value === null)
        return <Typography variant={"caption"} color={"secondary"}>Not set</Typography>;
    return <Chip size={size === "small" ? "smallest" : "small"} colorScheme={"greenLight"}>
        {value.toFixed(2)} €
    </Chip>;
}

// price: { dataType: "number", name: "Price", Preview: PricePreview }
```

Props: `value`, `property`, `propertyKey?`, `size: "small" | "medium" | "large"`, `width?`,
`height?`, `customProps?`, `interactive?`, `fill?`. To render the default preview of any property
yourself, use `<PropertyPreview propertyKey value property size/>`.

## Additional columns (`additionalFields`)

A column computed from the entity, not stored:

```tsx
import { AdditionalFieldDelegate, AsyncPreviewComponent } from "@firecms/core";

const spanishTitle: AdditionalFieldDelegate<Product> = {
    key: "spanish_title",
    name: "Spanish title",
    width: 200,
    Builder: ({ entity, context }) =>
        <AsyncPreviewComponent builder={
            context.dataSource.fetchEntity({
                path: `${entity.path}/${entity.id}/locales`,
                entityId: "es"
            }).then((locale) => locale?.values.name)
        }/>,
    dependencies: ["name"],                         // re-render when these change
    value: ({ entity }) => entity.values.name ?? "" // used for export
};

// additionalFields: [spanishTitle]   and optionally list "spanish_title" in propertiesOrder
```

`AsyncPreviewComponent` shows a skeleton until the promise resolves.

## Collection toolbar actions (`Actions`)

```tsx
import React from "react";
import { CollectionActionsProps, useSnackbarController } from "@firecms/core";
import { Button, PublishIcon } from "@firecms/ui";

export function PublishSelectedAction({ selectionController, context, path }: CollectionActionsProps) {
    const snackbarController = useSnackbarController();
    const selected = selectionController.selectedEntities;

    const publish = async () => {
        await Promise.all(selected.map((entity) =>
            context.dataSource.saveEntity({
                path,
                entityId: entity.id,
                values: { ...entity.values, status: "published" },
                status: "existing"
            })));
        selectionController.setSelectedEntities([]);
        snackbarController.open({ type: "success", message: `${selected.length} published` });
    };

    return <Button variant={"text"} disabled={selected.length === 0} onClick={publish}>
        <PublishIcon size={"small"}/>
        Publish selected
    </Button>;
}

// Actions: [PublishSelectedAction]
```

`CollectionActionsProps`: `path`, `relativePath`, `parentCollectionIds`, `collection`,
`selectionController` (`selectedEntities`, `setSelectedEntities`, `isEntitySelected`,
`toggleEntitySelection`), `tableController` (`filterValues`, `setFilterValues`, `sortBy`,
`setSortBy`, `searchString`, `setSearchString`, `clearFilter`, `data`...), `context`,
`collectionEntitiesCount`. Use `tableController.setFilterValues` to build custom filter widgets.

## Hooks

All exported by `@firecms/core`, usable inside any component rendered under `<FireCMS>`
(views, fields, previews, actions). In callbacks and entity actions you get the same controllers
in the `context` argument instead.

| Hook | Returns |
|---|---|
| `useFireCMSContext()` | Everything: `dataSource`, `storageSource`, `authController`, `navigation`, `sideEntityController`, `sideDialogsController`, `dialogsController`, `snackbarController`, `customizationController`, `userConfigPersistence`, `analyticsController`, `userManagement`. |
| `useDataSource(collection?)` | `fetchCollection`, `listenCollection`, `fetchEntity`, `listenEntity`, `saveEntity`, `deleteEntity`, `checkUniqueField`, `generateEntityId`. |
| `useStorageSource(collection?)` | `uploadFile`, `getDownloadURL`, `getFile`, `deleteFile`, `list`. |
| `useAuthController()` | `user`, `signOut()`, `getAuthToken()`, `extra`, `setExtra()`, `authLoading`. |
| `useNavigationController()` | `collections`, `views`, `getCollection(pathOrId)`, `navigate(to)`, `buildUrlCollectionPath(path)`, `basePath`, `homeUrl`... |
| `useSideEntityController()` | `open({ path, entityId?, collection?, copy?, selectedTab?, width?, onUpdate?, onClose? })`, `replace(...)`, `close()`. |
| `useSnackbarController()` | `open({ type: "success" \| "info" \| "warning" \| "error", message, autoHideDuration? })`, `close()`. |
| `useDialogsController()` | `open({ key, Component, props? })` returns `{ closeDialog }`; `close()`. |
| `useSideDialogsController()` | `open({ key, component, width? })`, `close(key?)`, `replace(...)`. |
| `useReferenceDialog({ path, multiselect?, onSingleEntitySelected?, onMultipleEntitiesSelected?, forceFilter?, selectedEntityIds? })` | `{ open, close }`: a dialog to pick entities. |
| `useCollectionFetch({ path, collection, filterValues?, sortBy?, itemCount?, searchString? })` | `{ data, dataLoading, noMoreToLoad, dataLoadingError }`, realtime when supported. |
| `useEntityFetch({ path, entityId, collection, useCache? })` | `{ entity, dataLoading, dataLoadingError }`, realtime. |
| `useSelectionController()` | A `SelectionController` to pass to `EntityCollectionView`. |
| `useModeController()` | `{ mode: "light" \| "dark", setMode }`. |
| `useLargeLayout()` | `true` on wide screens. |
| `useClipboard()` | `{ copy, isCoppied, clipboard, ... }`. |
| `useBrowserTitleAndIcon(name, logo?)` | Sets the tab title and icon. |
| `useTranslation()` | `{ t, i18n }` for FireCMS's own strings. |

Signatures and more examples: [references/hooks.md](references/hooks.md).

Opening things from a view:

```tsx
const sideEntityController = useSideEntityController();
// Edit an existing entity (collection resolved from the mounted navigation)
sideEntityController.open({ path: "products", entityId: "B003WT1622" });
// Create a new one
sideEntityController.open({ path: "products" });

const referenceDialog = useReferenceDialog({
    path: "products",
    onSingleEntitySelected: (entity) => entity && setProductId(entity.id)
});
// <Button onClick={referenceDialog.open}>Pick a product</Button>
```

A modal of your own goes through `useDialogsController` with a `Dialog` from `@firecms/ui`:

```tsx
import React from "react";
import { useDialogsController } from "@firecms/core";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@firecms/ui";

function ConfirmDialog({ open, closeDialog, message }: { open: boolean; closeDialog: () => void; message: string }) {
    return (
        <Dialog open={open} onOpenChange={(o) => !o && closeDialog()}>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent><Typography>{message}</Typography></DialogContent>
            <DialogActions>
                <Button variant={"text"} onClick={closeDialog}>Cancel</Button>
                <Button onClick={closeDialog}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
}

// const dialogsController = useDialogsController();
// dialogsController.open({ key: "confirm", Component: ConfirmDialog, props: { message: "Delete 3 items?" } });
```

## Writing data from custom code

- `dataSource.saveEntity({ path, entityId?, values, status: "new" | "existing" })` writes
  directly. It does **not** run the collection's `callbacks`.
- To run them (e.g. an `onPreSave` that computes fields), use `saveEntityWithCallbacks({ path,
  entityId, values, previousValues, status, collection, dataSource, context, onSaveSuccess?,
  onSaveFailure? })`, and `deleteEntityWithCallbacks({ entity, collection, callbacks, dataSource,
  context })` for deletes. Both are exported by `@firecms/core`.
- Values use CMS types: `Date` for dates, `EntityReference` for references, `GeoPoint` for
  geopoints (all from `@firecms/core`). The Firestore delegate converts them.
- To call a Cloud Function, use the Firebase SDK (`httpsCallable(getFunctions(), "name")`) inside
  the handler, not at module top level. In Cloud projects import from `@firebase/functions`,
  not `firebase/functions`.

## Checklist before you finish

- The component is built from `@firecms/ui` only, following `firecms-design-language`.
- It handles loading, empty and error states (`CircularProgress` or `Skeleton`, an empty message,
  `Alert` or a snackbar).
- It is registered in the right slot (`views`, `entityViews`, `Field`, `Preview`, `Actions`,
  `additionalFields`).
- No `any` casts; props typed with `FieldProps<T>`, `EntityCustomViewParams<M>`,
  `PropertyPreviewProps<T>`, `CollectionActionsProps`.
- The project's `build` script passes (it type-checks in the Vite templates).
