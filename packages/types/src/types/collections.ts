import React, { Dispatch, SetStateAction } from "react";
import { Entity, EntityStatus, EntityValues } from "./entities";
import { EntityCallbacks } from "./entity_callbacks";

import { EnumValues, Properties } from "./properties";
import { ExportConfig } from "./export_import";
import { EntityOverrides } from "./entity_overrides";
import { User } from "../users";
import { RebaseContext } from "../rebase_context";
import { Relation } from "./relations";
import { EntityCustomView } from "./entity_views";
import { EntityAction } from "./entity_actions";

/**
 * Base interface containing all driver-agnostic collection properties.
 * Use {@link PostgresCollection} or {@link FirebaseCollection} for
 * driver-specific type safety, or {@link EntityCollection} when you
 * need to handle any collection regardless of backend.
 *
 * @group Models
 */
export interface BaseEntityCollection<M extends Record<string, any> = any, USER extends User = any> {

    /**
     * You can set an alias that will be used internally instead of the `path`.
     * The `alias` value will be used to determine the URL of the collection,
     * while `path` will still be used in the driver.
     * Note that you can use this value in reference properties too.
     */
    slug: string;

    /**
     * Name of the collection, typically plural.
     * E.g. `Products`, `Blog`
     */
    name: string;

    /**
     * Singular name of an entry in this collection
     * E.g. `Product`, `Blog entry`
     */
    singularName?: string;

    /**
     * Optional description of this view. You can use Markdown.
     */
    description?: string;



    /**
     * Which driver handles this collection.
     * Use this to route collections to different backends:
     * - `"postgres"` - Route to PostgreSQL backend
     * - `"firestore"` - Route to Firestore (client-side)
     * - `"mongodb"` - Route to MongoDB backend
     * - Custom IDs for your own driver implementations
     *
     * If not specified, the default driver `"(default)"` is used.
     *
     * @example
     * // Simple - no driver needed for default
     * { slug: "products" }
     *
     * // Firestore collection (client-side real-time)
     * { slug: "analytics", driver: "firestore" }
     *
     * // Multiple databases within a driver
     * { slug: "orders", driver: "postgres", databaseId: "orders_db" }
     */
    driver?: string;

    /**
     * Which database within the driver.
     * - For Firestore: The Firestore database ID (e.g., for multi-database projects)
     * - For PostgreSQL: Schema or database name
     * - For MongoDB: Database name
     *
     * If not specified, the default database of the driver is used.
     */
    databaseId?: string;

    /**
     * Set of properties that compose an entity
     */
    properties: Properties;

    /**
     * Icon for the navigation sidebar or cards.
     */
    icon?: string | React.ReactNode;

    /**
     * Navigation group for this collection.
     */
    group?: string;

    /**
     * Array of entity views that this collection has.
     * Can be an array of `EntityCustomView` or a string representing the key of a global `EntityCustomView`.
     */
    entityViews?: (string | EntityCustomView<any>)[];

    /**
     * Default preview properties displayed when this collection is referenced to.
     */
    previewProperties?: string[];

    /**
     * Title property of the entity. This is the property that will be used
     * as the title in entity related views and references.
     * If not specified, the first property simple text property will be used.
     */
    titleProperty?: Extract<keyof M, string>;

    /**
     * When editing an entity, you can choose to open the entity in a side dialog
     * or in a full screen dialog. Defaults to `full_screen`.
     */
    openEntityMode?: "side_panel" | "full_screen";

    /**
     * Order in which the properties are displayed.
     * If you are specifying your collection as code, the order is the same as the
     * one you define in `properties`. Additional columns are added at the
     * end of the list, if the order is not specified.
     * You can use this prop to hide some properties from the table view.
     * Note that if you set this prop, other ways to hide fields, like
     * `hidden` in the property definition, will be ignored.
     * `propertiesOrder` has precedence over `hidden`.
     *     - For properties use the property key.
     *     - For additional fields use the field key.
     *     - If you have subcollections, you get a column for each subcollection,
     *       with the path (or alias) as the subcollection, prefixed with
     *       `subcollection:`. e.g. `subcollection:orders`.
     * You can use this prop to hide some properties from the table view.
     * Note that if you set this prop, other ways to hide fields, like
     * `hidden` in the property definition,will be ignored.
     * `propertiesOrder` has precedence over `hidden`.
     */
    propertiesOrder?: (Extract<keyof M, string> | string | `subcollection:${string}`)[];

    /**
     * If enabled, content is loaded in batches. If `false` all entities in the
     * collection are loaded. This means that when reaching the end of the
     * collection, the CMS will load more entities.
     * You can specify a number to specify the pagination size (50 by default)
     * Defaults to `true`
     */
    pagination?: boolean | number;


    selectionEnabled?: boolean;

    /**
     * This interface defines all the callbacks that can be used when an entity
     * is being created, updated or deleted.
     * Useful for adding your own logic or blocking the execution of the operation.
     */
    callbacks?: EntityCallbacks<M, USER>;

    /**
     * Pass your own selection controller if you want to control selected
     * entities externally.
     * @see useSelectionController
     */
    selectionController?: SelectionController<M>;

    /**
     * Force a filter in this view. If applied, the rest of the filters will
     * be disabled. Filters applied with this prop cannot be changed.
     * e.g. `forceFilter: { age: [">", 18] }`
     * e.g. `forceFilter: { related_user: ["==", new EntityReference("sdc43dsw2", "users")] }`
     */
    forceFilter?: FilterValues<Extract<keyof M, string>>;

    /**
     * Initial filters applied to the collection this collection is related to.
     * Defaults to none. Filters applied with this prop can be changed.
     * e.g. `filter: { age: [">", 18] }`
     * e.g. `filter: { related_user: ["==", new EntityReference("sdc43dsw2", "users")] }`
     */
    filter?: FilterValues<Extract<keyof M, string>>; // setting FilterValues<M> can break defining collections by code

    /**
     * Default sort applied to this collection.
     * When setting this prop, entities will have a default order
     * applied in the collection.
     * e.g. `sort: ["order", "asc"]`
     */
    sort?: [Extract<keyof M, string>, "asc" | "desc"];

    /**
     * You can add additional fields to the collection view by implementing
     * an additional field delegate.
     */
    additionalFields?: AdditionalFieldDelegate<M, USER>[];

    /**
     * Default size of the rendered collection
     */
    defaultSize?: CollectionSize;

    /**
     * Can the elements in this collection be edited inline in the collection
     * view. If this flag is set to false but `permissions.edit` is `true`, entities
     * can still be edited in the side panel
     */
    inlineEditing?: boolean;

    /**
     * Should this collection be hidden from the main navigation panel, if
     * it is at the root level, or in the entity side panel if it's a
     * subcollection.
     * It will still be accessible if you reach the specified path.
     * You can also use this collection as a reference target.
     */
    hideFromNavigation?: boolean;

    /**
     * If you want to open custom views or subcollections by default when opening the edit
     * view of an entity, you can specify the path to the view here.
     * The path is relative to the current collection. For example if you have a collection
     * that has a custom view as well as a subcollection that refers to another entity, you can
     * either specify the path to the custom view or the path to the subcollection.
     */
    defaultSelectedView?: string | DefaultSelectedViewBuilder;

    /**
     * Should the ID of this collection be hidden from the form view.
     */
    hideIdFromForm?: boolean;

    /**
     * Should the ID of this collection be hidden from the grid view.
     */
    hideIdFromCollection?: boolean;

    /**
     * If set to true, the form will be auto-saved when the user changes
     * the value of a field.
     * Defaults to false.
     * When a new entity is created, this property can be updated to generated a new ID
     */
    formAutoSave?: boolean;

    /**
     *
     */
    exportable?: boolean | ExportConfig<USER>;

    /**
     * User id of the owner of this collection. This is used only by plugins, or if you
     * are writing custom code
     */
    ownerId?: string;

    /**
     * Overrides for the entity view, like the data source or the storage source.
     */
    overrides?: EntityOverrides;

    /**
     * Width of the side dialog (in pixels) when opening an entity in this collection.
     */
    sideDialogWidth?: number | string;

    /**
     * If set to true, the default values of the properties will be applied
     * to the entity every time the entity is updated (not only when created).
     * Defaults to false.
     */
    alwaysApplyDefaultValues?: boolean;

    /**
     * If set to true, a tab including the JSON representation of the entity will be included.
     */
    includeJsonView?: boolean;

    /**
     * If set to true, changes to the entity will be saved in a subcollection.
     * This prop has no effect if the history plugin is not enabled
     */
    history?: boolean;

    /**
     * Should local changes be backed up in local storage, to prevent data loss on
     * accidental navigations.
     * - `manual_apply`: When the user navigates back to an entity with local changes,
     *   they will be prompted to restore the changes.
     * - `auto_apply`: When the user navigates back to an entity with local changes,
     *   the changes will be automatically applied.
     * - `false`: Local changes will not be backed up.
     * Defaults to `manual_apply`.
     */
    localChangesBackup?: "manual_apply" | "auto_apply" | false;

    /**
     * Default view mode for displaying this collection.
     * - "table": Display entities in a spreadsheet-like table (default)
     * - "cards": Display entities as a grid of cards with thumbnails
     * - "kanban": Display entities in a Kanban board grouped by a property
     * Defaults to "table".
     */
    defaultViewMode?: ViewMode;

    /**
     * Which view modes are available for this collection.
     * Possible values: "table", "cards", "kanban".
     * Defaults to all three: ["table", "cards", "kanban"].
     * Note: "kanban" will only be available if the collection has at least
     * one string property with enumValues defined, regardless of this setting.
     */
    enabledViews?: ViewMode[];

    /**
     * Configuration for Kanban board view mode.
     * When set, the Kanban view mode becomes available.
     */
    kanban?: KanbanConfig<M>;

    /**
     * Property key to use for ordering items.
     * Must reference a number property. When items are reordered,
     * this property will be updated to reflect the new order using
     * fractional indexing. Used by Kanban view for ordering within columns
     * and can be used for general ordering purposes.
     */
    orderProperty?: Extract<keyof M, string>;

    /**
     * Actions that can be performed on the entities in this collection.
     */
    entityActions?: EntityAction<M, USER>[];

    /**
     * Builder for the collection actions rendered in the toolbar
     */
    Actions?: React.ComponentType<CollectionActionsProps<M, USER>>[];

}

// ── Driver-specific collection types ──────────────────────────────────

/**
 * A collection backed by PostgreSQL (or any SQL database).
 * Adds support for SQL-style relations (JOINs) and Row Level Security.
 *
 * Use this type instead of {@link EntityCollection} when you want
 * compile-time safety that only SQL-relevant fields appear.
 *
 * @group Models
 */
export interface PostgresCollection<M extends Record<string, any> = any, USER extends User = any>
    extends BaseEntityCollection<M, USER> {

    /**
     * The driver for this collection. For Postgres collections this
     * can be omitted (Postgres is the default) or set to `"postgres"`.
     */
    driver?: "postgres" | undefined;

    /**
     * The PostgreSQL table name for this collection.
     */
    table: string;

    /**
     * Set by the backend when the resolved table name doesn't match
     * an actual table in the database schema.
     */
    isTableMissing?: boolean;

    /**
     * For SQL databases, you can define the relations between collections here.
     * Relations describe JOINs, foreign keys, and junction tables.
     */
    relations?: Relation[];

    /**
     * Security rules for this collection (Supabase-style Row Level Security).
     * When defined, the schema generator will enable RLS on the table and
     * create the corresponding PostgreSQL policies.
     *
     * Supports three levels of expressiveness:
     * 1. **Convenience shortcuts** — `ownerField`, `access`, `roles`
     * 2. **Raw SQL** — `using` and `withCheck` for full PostgreSQL power
     * 3. **Combined** — mix shortcuts with `roles` for common patterns
     *
     * The authenticated user context is available in raw SQL via:
     * - `auth.uid()`   — the current user's ID
     * - `auth.roles()` — comma-separated app role IDs
     * - `auth.jwt()`   — full JWT claims as JSONB
     */
    securityRules?: SecurityRule[];
}

/**
 * A collection backed by Firebase / Firestore.
 * Adds support for subcollections (nested document collections).
 *
 * Use this type instead of {@link EntityCollection} when you want
 * compile-time safety that only Firestore-relevant fields appear.
 *
 * @group Models
 */
export interface FirebaseCollection<M extends Record<string, any> = any, USER extends User = any>
    extends BaseEntityCollection<M, USER> {

    /**
     * The driver for this collection. Must be set to `"firestore"`.
     */
    driver: "firestore";

    /**
     * You can add subcollections to your entity in the same way you define the root
     * collections. The collections added here will be displayed when opening
     * the side dialog of an entity.
     */
    subcollections?: () => EntityCollection<any>[];
}

/**
 * A collection backed by any data source.
 * This is a discriminated union — use {@link PostgresCollection} or
 * {@link FirebaseCollection} for driver-specific type safety.
 *
 * @group Models
 */
export type EntityCollection<M extends Record<string, any> = any, USER extends User = any> =
    | PostgresCollection<M, USER>
    | FirebaseCollection<M, USER>;

// ── Type guards ───────────────────────────────────────────────────────

/**
 * Type guard for PostgreSQL collections.
 * Returns true if the collection uses the Postgres driver (or the default driver).
 * @group Models
 */
export function isPostgresCollection<M extends Record<string, any> = any, USER extends User = any>(
    collection: EntityCollection<M, USER>
): collection is PostgresCollection<M, USER> {
    return !collection.driver || collection.driver === "postgres";
}

/**
 * Type guard for Firebase / Firestore collections.
 * @group Models
 */
export function isFirebaseCollection<M extends Record<string, any> = any, USER extends User = any>(
    collection: EntityCollection<M, USER>
): collection is FirebaseCollection<M, USER> {
    return collection.driver === "firestore";
}


/**
 * Configuration for Kanban board view mode.
 * @group Collections
 */
export interface KanbanConfig<M extends Record<string, any> = any> {
    /**
     * Property key to use for Kanban board columns.
     * Must reference a string property with enumValues defined.
     * Entities will be grouped into columns based on this property's value.
     * The column order is determined by the order of enumValues in the property.
     */
    columnProperty: Extract<keyof M, string>;
}

/**
 * View mode for displaying a collection.
 * @group Collections
 */
export type ViewMode = "table" | "cards" | "kanban";

/**
 * Parameter passed to the `Actions` prop in the collection configuration.
 * The component will receive this prop when it is rendered in the collection
 * toolbar.
 *
 * @group Models
 */
export interface CollectionActionsProps<M extends Record<string, any> = any, USER extends User = User, EC extends EntityCollection<M> = EntityCollection<M>> {
    /**
     * Full collection path of this entity. This is the full path, like
     * `users/1234/addresses`
     */
    path: string;

    /**
     * Path of the last collection, like `addresses`
     */
    relativePath: string;

    /**
     * Array of the parent path segments like `['users']`
     */
    parentCollectionIds: string[];

    /**
     * The collection configuration
     */
    collection: EC;

    /**
     * Use this controller to get the selected entities and to update the
     * selected entities state.
     */
    selectionController: SelectionController<M>;

    /**
     * Use this controller to get the table controller and to update the
     * table controller state.
     */
    tableController: EntityTableController<M>;

    /**
     * Context of the app status
     */
    context: RebaseContext<USER>;

    /**
     * Count of the entities in this collection.
     * undefined means the count is still loading.
     */
    collectionEntitiesCount?: number;

}

/**
 * Use this controller to retrieve the selected entities or modify them in
 * an {@link EntityCollection}
 * @group Models
 */
export type SelectionController<M extends Record<string, any> = any> = {
    selectedEntities: Entity<M>[];
    setSelectedEntities: Dispatch<SetStateAction<Entity<M>[]>>;
    isEntitySelected: (entity: Entity<M>) => boolean;
    toggleEntitySelection: (entity: Entity<M>, newSelectedState?: boolean) => void;
}

/**
 * Filter conditions in a `Query.where()` clause are specified using the
 * strings `<`, `<=`, `==`, `>=`, `>`, `array-contains`, `in`, and `array-contains-any`.
 * @group Models
 */
export type WhereFilterOp =
    | "<"
    | "<="
    | "=="
    | "!="
    | ">="
    | ">"
    | "array-contains"
    | "in"
    | "not-in"
    | "array-contains-any";

/**
 * Used to define filters applied in collections
 *
 * e.g. `{ age: [">=", 18] }`
 *
 * @group Models
 */
export type FilterValues<Key extends string> =
    Partial<Record<Key, [WhereFilterOp, any]>>;

/**
 * Used to indicate valid filter combinations (e.g. created in Firestore)
 * If the user selects a specific filter/sort combination, the CMS checks if it's
 * valid, otherwise it reverts to the simpler valid case
 * @group Models
 */
export type FilterCombination<Key extends string> = Partial<Record<Key, "asc" | "desc">>;

/**
 * Sizes in which a collection can be rendered
 * @group Models
 */
export type CollectionSize = "xs" | "s" | "m" | "l" | "xl";

export type AdditionalFieldDelegateProps<M extends Record<string, any> = any, USER extends User = User> = {
    entity: Entity<M>,
    context: RebaseContext<USER>
};

/**
 * Use this interface for adding additional fields to entity collection views and forms.
 * @group Models
 */
export interface AdditionalFieldDelegate<M extends Record<string, any> = any,
    USER extends User = User> {

    /**
     * ID of this column. You can use this id in the `properties` field of the
     * collection in any order you want
     */
    key: string;

    /**
     * Header of this column
     */
    name: string;

    /**
     * Width of the generated column in pixels
     */
    width?: number;

    /**
     * Builder for the custom field
     */
    Builder?: React.ComponentType<{ entity: Entity<M>, context: RebaseContext<USER> }>;



    /**
     * If this column needs to update dynamically based on other properties,
     * you can define an array of keys as strings with the
     * `dependencies` prop.
     * e.g. ["name", "surname"]
     * This is a performance optimization, if you don't define dependencies
     * it will be updated in every render.
     */
    dependencies?: Extract<keyof M, string>[];

    /**
     * Use this prop to define the value of the column as a string or number.
     * This is the value that will be used for exporting the collection.
     * If `Builder` is defined, this prop will be ignored in the collection
     * view.
     * @param entity
     */
    value?: (props: {
        entity: Entity<M>,
        context: RebaseContext
    }) => string | number | Promise<string | number> | undefined;
}


export type InferCollectionType<S extends EntityCollection> = S extends EntityCollection<infer M> ? M : never;

/**
 * Used in the {@link EntityCollection#defaultSelectedView} to define the default
 * @group Models
 */
export type DefaultSelectedViewBuilder = (params: DefaultSelectedViewParams) => string | undefined;

/**
 * Used in the {@link EntityCollection#defaultSelectedView} to define the default
 * @group Models
 */
export type DefaultSelectedViewParams = {
    status?: EntityStatus;
    entityId?: string | number;
};
/**
 * You can use this controller to control the table view of a collection.
 */
export type EntityTableController<M extends Record<string, any> = any> = {
    data: Entity<M>[];
    dataLoading: boolean;
    noMoreToLoad: boolean;
    dataLoadingError?: Error;
    filterValues?: FilterValues<Extract<keyof M, string>>;
    setFilterValues?: (filterValues: FilterValues<Extract<keyof M, string>>) => void;
    sortBy?: [Extract<keyof M, string>, "asc" | "desc"];
    setSortBy?: (sortBy?: [Extract<keyof M, string>, "asc" | "desc"]) => void;
    searchString?: string;
    setSearchString?: (searchString?: string) => void;
    clearFilter?: () => void;
    itemCount?: number;
    setItemCount?: (itemCount: number) => void;
    initialScroll?: number;
    onScroll?: (props: {
        scrollDirection: "forward" | "backward",
        scrollOffset: number,
        scrollUpdateWasRequested: boolean
    }) => void;
    paginationEnabled?: boolean;
    pageSize?: number;
    checkFilterCombination?: (filterValues: FilterValues<any>,
        sortBy?: [string, "asc" | "desc"]) => boolean;
    popupCell?: SelectedCellProps<M>;
    setPopupCell?: (popupCell?: SelectedCellProps<M>) => void;

    onAddColumn?: (column: string) => void;
}

export type SelectedCellProps<M extends Record<string, any> = any> = {
    propertyKey: Extract<keyof M, string>;
    cellRect: DOMRect;
    width: number;
    height: number;
    entityPath: string;
    entityId: string | number;
};

/**
 * SQL operation that a policy applies to.
 * @group Models
 */
export type SecurityOperation = "select" | "insert" | "update" | "delete" | "all";

/**
 * Flexible Row Level Security rule for a collection.
 *
 * Inspired by Supabase's approach to PostgreSQL RLS. Rules can range from
 * simple convenience shortcuts to fully custom SQL expressions, giving you the
 * full power of PostgreSQL Row Level Security.
 *
 * The authenticated user's identity is available in raw SQL via:
 * - `auth.uid()`   — the user's ID
 * - `auth.roles()` — comma-separated app role IDs
 * - `auth.jwt()`   — full JWT claims as JSONB
 *
 * These are set automatically per-transaction by the backend.
 *
 * **How rules combine:** PostgreSQL evaluates all matching policies for an
 * operation. Permissive rules are OR'd together (any one passing is enough).
 * Restrictive rules are AND'd (all must pass). This mirrors Supabase behavior.
 *
 * @group Models
 */
export interface SecurityRule {
    /**
     * Optional human-readable name for the policy.
     * If not provided, one will be auto-generated from the table name and operation.
     * Must be unique per table.
     *
     * When using `operations` (array), each generated policy will have the
     * operation name appended, e.g. `"owner_access_select"`, `"owner_access_update"`.
     */
    name?: string;

    /**
     * Which SQL operation this policy applies to.
     * Use this when the policy targets a single operation or all operations.
     *
     * For multiple specific operations, use `operations` (array) instead.
     * If neither is specified, defaults to `"all"`.
     *
     * @default "all"
     */
    operation?: SecurityOperation;

    /**
     * Array of SQL operations this policy applies to.
     * The compiler will generate one PostgreSQL policy per operation, sharing
     * the same configuration.
     *
     * This reduces boilerplate when the same rule applies to multiple (but not all)
     * operations.
     *
     * Takes precedence over `operation` (singular) if both are specified.
     *
     * @example
     * // Same rule for select and update
     * { operations: ["select", "update"], ownerField: "user_id" }
     *
     * @example
     * // Equivalent to operation: "all"
     * { operations: ["all"], ownerField: "user_id" }
     */
    operations?: SecurityOperation[];

    /**
     * Whether this policy is `"permissive"` (default) or `"restrictive"`.
     *
     * - **permissive**: Multiple permissive policies for the same operation are
     *   OR'd together — if *any* passes, access is granted.
     * - **restrictive**: Restrictive policies are AND'd with all permissive
     *   policies — they act as additional gates that *must* also pass.
     *
     * This is the same model as PostgreSQL / Supabase.
     *
     * @default "permissive"
     */
    mode?: "permissive" | "restrictive";

    // ── Convenience shortcuts ───────────────────────────────────────────

    /**
     * **Shortcut.** The property (column) that stores the owner's user ID.
     * Generates a USING/WITH CHECK clause like:
     *   `<column> = auth.uid()`
     *
     * Cannot be combined with `using` / `withCheck` / `access`.
     *
     * @example
     * { operation: "all", ownerField: "user_id" }
     */
    ownerField?: string;

    /**
     * **Shortcut.** Grant unrestricted row access (no row filtering) for this operation.
     * Generates `USING (true)`.
     *
     * This means "no row-level filter", NOT "anonymous/unauthenticated access".
     * Authentication is still enforced at the API layer — this only controls which
     * *rows* authenticated users can see.
     *
     * Typically used alone for genuinely public read endpoints, or combined with
     * `roles` to give certain roles an unfiltered view of the table.
     *
     * Cannot be combined with `using` / `withCheck` / `ownerField`.
     *
     * @example
     * // Public read (any authenticated user sees all rows)
     * { operation: "select", access: "public" }
     */
    access?: "public";

    /**
     * **Shortcut.** Restrict this rule to users that have one of these
     * application-level roles.
     *
     * **Important:** These are NOT native PostgreSQL database roles. They are
     * application roles managed by Rebase, stored in the `rebase.user_roles`
     * table, and injected into each transaction via `auth.roles()`.
     *
     * Generates a condition like:
     *   `auth.roles() ~ '<role1>|<role2>'`
     *
     * Can be combined with `ownerField`, `access`, or raw `using`/`withCheck`.
     * When combined, the role check is AND'd with the other condition.
     *
     * @example
     * // Only admins can delete
     * { operation: "delete", roles: ["admin"] }
     *
     * @example
     * // Admins have unfiltered read access to all rows
     * { operation: "select", roles: ["admin"], using: "true" }
     */
    roles?: string[];

    // ── Raw SQL expressions (full power) ────────────────────────────────

    /**
     * Raw SQL expression for the `USING` clause.
     * This controls which *existing* rows are visible / can be modified / deleted.
     * Applied to SELECT, UPDATE, and DELETE.
     *
     * You can reference columns via `{column_name}` which will be resolved to
     * `table.column_name` in the generated Drizzle code. You can also use any
     * valid PostgreSQL expression.
     *
     * Cannot be combined with `ownerField` or `access`.
     *
     * @example
     * // Rows published in the last 30 days are visible
     * { operation: "select", using: "{published_at} > now() - interval '30 days'" }
     *
     * @example
     * // Only the owner, or users with 'moderator' role
     * {
     *   operation: "select",
     *   using: "{user_id} = auth.uid() OR auth.roles() ~ 'moderator'"
     * }
     *
     * @example
     * // Cross-table subquery: only if user belongs to the org
     * {
     *   operation: "select",
     *   using: "EXISTS (SELECT 1 FROM org_members WHERE org_members.org_id = {org_id} AND org_members.user_id = auth.uid())"
     * }
     */
    using?: string;

    /**
     * Raw SQL expression for the `WITH CHECK` clause.
     * This controls which *new/updated* row values are allowed.
     * Applied to INSERT and UPDATE.
     *
     * Same syntax as `using` — use `{column_name}` to reference columns.
     *
     * **Important for UPDATE:** PostgreSQL evaluates two row states — the
     * *existing* row (`USING`) and the *incoming new* row (`WITH CHECK`).
     * If you only specify `using`, the same expression is used for both.
     * For security-sensitive updates, always specify `withCheck` explicitly
     * to constrain what the new row values can be.
     *
     * If not provided on INSERT/UPDATE policies, falls back to `using`
     * (which matches PostgreSQL's own default behavior).
     *
     * Cannot be combined with `ownerField` or `access`.
     *
     * @example
     * // Users can only insert rows where they are the owner
     * { operation: "insert", withCheck: "{user_id} = auth.uid()" }
     *
     * @example
     * // Prevent changing the status to 'archived' unless admin
     * {
     *   operation: "update",
     *   using: "{user_id} = auth.uid()",
     *   withCheck: "{status} != 'archived' OR auth.roles() ~ 'admin'"
     * }
     *
     * @example
     * // Restrictive gate: prevent locking AND unlocking unless admin.
     * // `using` checks the old row state, `withCheck` checks the new.
     * {
     *   operation: "update",
     *   mode: "restrictive",
     *   using: "{is_locked} = false",
     *   withCheck: "{is_locked} = false"
     * }
     */
    withCheck?: string;

    // ── Advanced: native PostgreSQL role targeting ───────────────────────

    /**
     * **Advanced.** Native PostgreSQL database roles the policy applies to.
     *
     * By default, all generated policies target the `public` role (i.e.
     * every database connection). This is correct for most setups where
     * a single database role is used for all connections.
     *
     * **Important:** These are NOT the same as the application-level `roles`
     * (admin, editor, viewer, etc.) — those are enforced in the USING/WITH
     * CHECK clauses via `auth.roles()`. This field controls the PostgreSQL
     * `TO` clause in `CREATE POLICY ... TO role_name`.
     *
     * Use this if you have dedicated PostgreSQL roles (e.g. `app_read`,
     * `app_write`) and want policies to target specific ones.
     *
     * @default ["public"]
     *
     * @example
     * // Only apply this policy when connected as `app_role`
     * { operation: "select", access: "public", pgRoles: ["app_role"] }
     */
    pgRoles?: string[];
}
