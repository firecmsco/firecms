# EntityCollection props

From `packages/firecms_core/src/types/collections.ts`
(`node_modules/@firecms/core/dist/types/collections.d.ts`). `EntityCollection<M, USER>`, where `M`
is the document type.

## Identity and navigation

| Prop | Type | Notes |
|---|---|---|
| `id` | `string` | **Required.** Used in URLs (`/c/<id>`), by reference properties, and to match UI-edited configs. |
| `name` | `string` | **Required.** Plural name. |
| `path` | `string` | **Required.** Firestore path, relative to the parent document for subcollections. |
| `properties` | `PropertiesOrBuilders<M>` | **Required.** |
| `singularName` | `string` | E.g. "Product". |
| `description` | `string` | Markdown allowed. |
| `icon` | `string \| ReactNode` | Material icon key (`"shopping_cart"`) or a node. |
| `group` | `string` | Deprecated: use `navigationGroupMappings` in `useBuildNavigationController`. |
| `hideFromNavigation` | `boolean` | Still reachable by URL and as a reference target. |
| `databaseId` | `string` | Non-default Firestore database. |
| `collectionGroup` | `boolean` | Query all collections with this `path` name. Adds a `collectionGroupParent` column. |
| `subcollections` | `EntityCollection[]` | Shown as tabs in the entity view. |
| `editable` | `boolean` | Can the collection editor change this collection. Default `true`. |
| `ownerId` | `string` | For plugins. |

## Display

| Prop | Type | Notes |
|---|---|---|
| `propertiesOrder` | `(keyof M \| string \| \`subcollection:${string}\` \| "collectionGroupParent")[]` | Order of columns and fields. Unlisted properties are hidden from the table. |
| `titleProperty` | `keyof M` | Title in entity views and references. Default: first string property. |
| `previewProperties` | `string[]` | Shown when the entity is referenced. |
| `imageProperty` | `keyof M` | Thumbnail in cards and kanban. A storage image property or `url: "image"` string. |
| `defaultSize` | `"xs" \| "s" \| "m" \| "l" \| "xl"` | Row size. |
| `defaultViewMode` | `"table" \| "cards" \| "kanban"` | Default `"table"`. |
| `enabledViews` | `ViewMode[]` | Default all three; kanban only if a string property has `enumValues`. |
| `kanban` | `{ columnProperty: keyof M }` | String property with `enumValues`; columns follow enum order. |
| `orderProperty` | `keyof M` | Number property updated with fractional indexing when items are reordered. |
| `openEntityMode` | `"side_panel" \| "full_screen"` | Default `"side_panel"`. |
| `sideDialogWidth` | `number \| string` | Width of the side panel. |
| `hideIdFromForm` | `boolean` | |
| `hideIdFromCollection` | `boolean` | |
| `includeJsonView` | `boolean` | Adds a JSON tab to the entity view. |
| `entityViews` | `(string \| EntityCustomView<M>)[]` | Custom tabs; a string is the key of a registered view. |
| `viewGroups` | `{ name: string; views: string[] }[]` | Group subcollection ids and view keys under one dropdown tab. |
| `defaultSelectedView` | `string \| ({ status, entityId }) => string \| undefined` | Tab opened first. |
| `additionalFields` | `AdditionalFieldDelegate<M>[]` | Computed columns. |
| `Actions` | `ComponentType<CollectionActionsProps> \| ComponentType<CollectionActionsProps>[]` | Toolbar components. |

## Data behaviour

| Prop | Type | Notes |
|---|---|---|
| `customId` | `boolean \| "optional" \| EnumValues` | How document ids are chosen. Default: generated. |
| `pagination` | `boolean \| number` | Default `true` (50 per page). `false` loads all. |
| `initialFilter` | `FilterValues` | E.g. `{ age: [">=", 18] }`. The user can change it. |
| `forceFilter` | `FilterValues` | Fixed filter; other filters disabled. |
| `allowedFilters` | `(keyof M)[]` | Filterable properties; `[]` hides filters. |
| `initialSort` | `[keyof M, "asc" \| "desc"]` | |
| `textSearchEnabled` | `boolean` | Search bar; needs a search backend (see SKILL.md, Text search). |
| `inlineEditing` | `boolean` | Edit cells in the table. `false` forces the form. |
| `selectionEnabled` | `boolean` | Default `true`. |
| `selectionController` | `SelectionController<M>` | Control selection from outside (`useSelectionController`). |
| `formAutoSave` | `boolean` | Save on every change. Not with `customId`. |
| `alwaysApplyDefaultValues` | `boolean` | Apply property `defaultValue`s on every save. |
| `localChangesBackup` | `"manual_apply" \| "auto_apply" \| false` | Unsaved changes kept in local storage. Default `"manual_apply"`. |
| `history` | `boolean` | Record changes (needs the entity history plugin). |
| `exportable` | `boolean \| { additionalFields: { key, builder }[] }` | Export options (export plugin). |
| `overrides` | `{ dataSourceDelegate?, storageSource? }` | Use a different data source or storage for this collection. |

## Access and logic

| Prop | Type | Notes |
|---|---|---|
| `permissions` | `{ read?, create?, edit?, delete? } \| PermissionsBuilder` | UI permissions; all default `true`. |
| `callbacks` | `EntityCallbacks<M>` | `onFetch`, `onPreSave`, `onSaveSuccess`, `onSaveFailure`, `onPreDelete`, `onDelete`, `onIdUpdate`. |
| `entityActions` | `(EntityAction<M> \| string)[]` | Row and form actions; a string is the key of a registered action. |

## Types used above

```ts
type FilterValues<Key extends string> = Partial<Record<Key, [WhereFilterOp, any]>>;
type WhereFilterOp = "<" | "<=" | "==" | "!=" | ">=" | ">" | "array-contains" | "in" | "not-in" | "array-contains-any";

interface PermissionsBuilderProps {
    entity: Entity<M> | null;   // null for collection-level decisions (create)
    path: string;
    pathSegments: string[];
    user: USER | null;
    collection: EntityCollection;
    authController: AuthController<USER>;
}

interface EntityOnSaveProps<M> {
    collection: ResolvedEntityCollection<M>;
    path: string;
    resolvedPath: string;
    entityId: string;            // optional in onPreSave / onSaveFailure
    values: Partial<M>;
    previousValues?: Partial<M>;
    status: "new" | "existing" | "copy";
    context: FireCMSContext;
}

interface EntityOnDeleteProps<M> { collection; path; entityId: string; entity: Entity<M>; context }
interface EntityOnFetchProps<M>  { collection; path; entity: Entity<M>; context }
interface EntityIdUpdateProps<M> { collection; path; entityId?: string; values: M; context }

type EntityAction<M> = {
    name: string;
    key?: string;                       // "edit" | "delete" | "copy" replace built-ins
    icon?: React.ReactElement;
    onClick: (props: EntityActionClickProps<M>) => Promise<void> | void;
    isEnabled?: (props: EntityActionClickProps<M>) => boolean;
    collapsed?: boolean;                // default true: inside the "..." menu
    includeInForm?: boolean;            // default true
};

type EntityActionClickProps<M> = {
    entity?: Entity<M>;
    context: FireCMSContext;
    fullPath?: string;
    fullIdPath?: string;
    collection?: EntityCollection<M>;
    formContext?: FormContext;          // present when called from the form
    sideEntityController?: SideEntityController;
    view: "collection" | "form";
    openEntityMode: "side_panel" | "full_screen";
    selectionController?: SelectionController;
    highlightEntity?: (entity) => void;
    unhighlightEntity?: (entity) => void;
    navigateBack?: () => void;
    onCollectionChange?: () => void;
};

type Entity<M> = { id: string; path: string; values: M; databaseId?: string };
```
