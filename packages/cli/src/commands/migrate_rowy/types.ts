/**
 * The parts of a Rowy project's configuration that `firecms migrate rowy` reads.
 *
 * Rowy keeps all of it in the project's own Firestore, under `_rowy_`:
 * - `_rowy_/settings`, field `tables`: one entry per table
 * - `_rowy_/settings/schema/{tableId}`: the columns of a collection table
 * - `_rowy_/settings/groupSchema/{tableId}`: the columns of a collection group table
 * - `{schema doc}/subTables/{fieldName}`: the columns of a sub-table, nested under its parent
 *
 * The shapes follow Rowy's own types (rowyio/rowy, `src/types/table.d.ts` and
 * `src/types/settings.d.ts`). Only the fields the migration uses are listed.
 */

export type RowyTableSettings = {
    id: string;
    /** Firestore collection path, or the collection id of a collection group */
    collection: string;
    name?: string;
    /** Roles that can see the table */
    roles?: string[];
    /** Roles that can change the table's columns */
    modifiableBy?: string[];
    section?: string;
    description?: string;
    tableType?: "primaryCollection" | "collectionGroup";
    readOnly?: boolean;
    /** Rowy writes `_createdBy` and `_updatedBy` unless this is `false` */
    audit?: boolean;
    auditFieldCreatedBy?: string;
    auditFieldUpdatedBy?: string;
};

export type RowyColumn = {
    key?: string;
    /** Field key in the document. Can be a dot path, like `_createdBy.timestamp` */
    fieldName: string;
    name?: string;
    /** A Rowy field type, like `SIMPLE_TEXT` or `DERIVATIVE` */
    type: string;
    index?: number;
    width?: number;
    /** `false` locks the column */
    editable?: boolean;
    hidden?: boolean;
    config?: Record<string, any>;
};

export type RowyExtension = {
    name?: string;
    type?: string;
    active?: boolean;
    triggers?: string[];
    requiredFields?: string[];
    extensionBody?: string;
    conditions?: string;
};

export type RowyWebhook = {
    name?: string;
    type?: string;
    active?: boolean;
    endpoint?: string;
    parser?: string;
    conditions?: string;
    /** Verification secrets. Never copied by the migration. */
    auth?: unknown;
};

export type RowySchema = {
    columns?: Record<string, RowyColumn>;
    idType?: "decrement" | "random" | "custom";
    sorts?: { key: string; direction?: "asc" | "desc" }[];
    filters?: { key: string; operator: string; value: unknown }[];
    joinOperator?: "AND" | "OR";
    extensionObjects?: RowyExtension[];
    webhooks?: RowyWebhook[];
    subTables?: Record<string, RowySchema>;
    /** Extensions from before Rowy 2.4 */
    sparks?: string;
};

export type RowyProjectSettings = {
    tables?: RowyTableSettings[];
    services?: {
        /** Base URL of the `rowy-hooks` Cloud Run service that receives webhooks */
        hooks?: string;
    };
};

export type RowyConfig = {
    settings: RowyProjectSettings;
    /** Keyed by table id */
    schemas: Record<string, RowySchema>;
    /** Keyed by table id */
    groupSchemas: Record<string, RowySchema>;
};
