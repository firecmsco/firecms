/**
 * Describes the capabilities and features supported by a data source (driver).
 *
 * Each driver (Postgres, Firebase, MongoDB, etc.) declares which features it
 * supports. The CMS uses this descriptor to:
 * - Show/hide editor tabs (e.g. Relations for SQL, Subcollections for Firebase)
 * - Filter the property type picker (e.g. `relation` for SQL, `reference` for Firebase)
 * - Toggle driver-specific form controls (e.g. `columnType` for SQL)
 *
 * @group Models
 */
export interface DataSourceCapabilities {
    /** Unique driver key (e.g. "postgres", "firestore", "mongodb") */
    key: string;

    /** Human-readable label for the UI (e.g. "PostgreSQL", "Firebase / Firestore") */
    label: string;

    // ── Feature flags ─────────────────────────────────────────────────
    /** Does this source support SQL-style relations (JOINs)? */
    supportsRelations: boolean;

    /** Does this source support nested subcollections? */
    supportsSubcollections: boolean;

    /** Does this source support Row Level Security policies? */
    supportsRLS: boolean;

    /** Does this source support document references (Firebase-style)? */
    supportsReferences: boolean;

    /** Does this source support SQL column type annotations? */
    supportsColumnTypes: boolean;

    /** Does this source support real-time listeners? */
    supportsRealtime: boolean;

    // ── Admin capability flags ───────────────────────────────────────
    /** Does this source support SQL admin operations (SQL editor, EXPLAIN, etc.)? */
    supportsSQLAdmin: boolean;

    /** Does this source support document admin operations (aggregation, stats)? */
    supportsDocumentAdmin: boolean;

    /** Does this source support schema admin (unmapped tables, table metadata)? */
    supportsSchemaAdmin: boolean;
}

/**
 * Subset of DataSourceCapabilities containing only feature flags.
 * Useful when you only need to check capabilities without UI metadata.
 * @group Models
 */
export type DataSourceFeatures = Pick<
    DataSourceCapabilities,
    | "supportsRelations"
    | "supportsSubcollections"
    | "supportsRLS"
    | "supportsReferences"
    | "supportsColumnTypes"
    | "supportsRealtime"
    | "supportsSQLAdmin"
    | "supportsDocumentAdmin"
    | "supportsSchemaAdmin"
>;

// ── Built-in driver capabilities ─────────────────────────────────────

/** @group Models */
export const POSTGRES_CAPABILITIES: DataSourceCapabilities = {
    key: "postgres",
    label: "PostgreSQL",
    supportsRelations: true,
    supportsSubcollections: false,
    supportsRLS: true,
    supportsReferences: false,
    supportsColumnTypes: true,
    supportsRealtime: true,
    supportsSQLAdmin: true,
    supportsDocumentAdmin: false,
    supportsSchemaAdmin: true,
};

/** @group Models */
export const FIREBASE_CAPABILITIES: DataSourceCapabilities = {
    key: "firestore",
    label: "Firebase / Firestore",
    supportsRelations: false,
    supportsSubcollections: true,
    supportsRLS: false,
    supportsReferences: true,
    supportsColumnTypes: false,
    supportsRealtime: true,
    supportsSQLAdmin: false,
    supportsDocumentAdmin: false,
    supportsSchemaAdmin: false,
};

/** @group Models */
export const MONGODB_CAPABILITIES: DataSourceCapabilities = {
    key: "mongodb",
    label: "MongoDB",
    supportsRelations: false,
    supportsSubcollections: true,
    supportsRLS: false,
    supportsReferences: true,
    supportsColumnTypes: false,
    supportsRealtime: false,
    supportsSQLAdmin: false,
    supportsDocumentAdmin: true,
    supportsSchemaAdmin: true,
};

/**
 * Fallback capabilities when the driver is unknown.
 * Enables everything so nothing is hidden unexpectedly.
 * @group Models
 */
export const DEFAULT_CAPABILITIES: DataSourceCapabilities = {
    key: "(default)",
    label: "Default",
    supportsRelations: true,
    supportsSubcollections: true,
    supportsRLS: true,
    supportsReferences: true,
    supportsColumnTypes: true,
    supportsRealtime: true,
    supportsSQLAdmin: true,
    supportsDocumentAdmin: true,
    supportsSchemaAdmin: true,
};

const CAPABILITIES_REGISTRY: Record<string, DataSourceCapabilities> = {
    postgres: POSTGRES_CAPABILITIES,
    firestore: FIREBASE_CAPABILITIES,
    mongodb: MONGODB_CAPABILITIES,
    "(default)": DEFAULT_CAPABILITIES,
};

/**
 * Look up capabilities for a given driver key.
 * If `driver` is undefined or not found, returns `DEFAULT_CAPABILITIES`.
 * @group Models
 */
export function getDataSourceCapabilities(driver?: string): DataSourceCapabilities {
    if (!driver) return POSTGRES_CAPABILITIES; // postgres is the default driver
    return CAPABILITIES_REGISTRY[driver] ?? DEFAULT_CAPABILITIES;
}

/**
 * Register custom capabilities for a third-party driver.
 * @group Models
 */
export function registerDataSourceCapabilities(capabilities: DataSourceCapabilities): void {
    CAPABILITIES_REGISTRY[capabilities.key] = capabilities;
}
