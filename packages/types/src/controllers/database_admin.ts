import { TableMetadata } from "../types";

/**
 * Administrative database operations.
 * These are used only by the studio/admin UI (SQL editor, schema browser, etc.)
 * and are NOT part of the public `data` API.
 *
 * @group Admin
 */
export interface DatabaseAdmin {
    /**
     * Execute raw SQL (if supported by the driver)
     */
    executeSql?(sql: string, options?: { database?: string; role?: string }): Promise<Record<string, unknown>[]>;

    /**
     * Fetch the available databases (if supported by the driver)
     */
    fetchAvailableDatabases?(): Promise<string[]>;

    /**
     * Fetch the available roles (if supported by the driver)
     */
    fetchAvailableRoles?(): Promise<string[]>;

    /**
     * Fetch the current database name (if supported by the driver)
     */
    fetchCurrentDatabase?(): Promise<string | undefined>;

    /**
     * Fetch database tables not yet mapped to a collection (if supported)
     */
    fetchUnmappedTables?(mappedPaths?: string[]): Promise<string[]>;

    /**
     * Fetch table metadata for a given table (if supported)
     */
    fetchTableMetadata?(tableName: string): Promise<TableMetadata>;
}
