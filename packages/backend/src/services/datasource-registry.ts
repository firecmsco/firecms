/**
 * Datasource Registry
 *
 * Manages multiple datasource delegates for FireCMS backend.
 * Allows different databases for different collections.
 *
 * Usage:
 * - Single DB: Pass a single DataSourceDelegate → maps to "(default)"
 * - Multiple DBs: Pass a map of { dbId: DataSourceDelegate }
 * - Collections use `databaseId` property to specify which datasource to use
 * - Collections without `databaseId` fallback to "(default)"
 */

import { DataSourceDelegate } from "@firecms/types";

/**
 * The default datasource identifier used when:
 * - A single datasource is provided (not a map)
 * - A collection doesn't specify a databaseId
 */
export const DEFAULT_DATASOURCE_ID = "(default)";

/**
 * Registry for managing multiple datasource delegates
 */
export interface DatasourceRegistry {
    /**
     * Register a datasource delegate with an ID
     * @param id - Unique identifier for this datasource (e.g., "analytics", "users")
     * @param delegate - The DataSourceDelegate instance
     */
    register(id: string, delegate: DataSourceDelegate): void;

    /**
     * Get the default datasource delegate (id = "(default)")
     * @throws Error if no default datasource is registered
     */
    getDefault(): DataSourceDelegate;

    /**
     * Get a datasource delegate by ID
     * @param id - Datasource identifier, or undefined/null for default
     * @returns The DataSourceDelegate, or undefined if not found
     */
    get(id: string | undefined | null): DataSourceDelegate | undefined;

    /**
     * Get a datasource delegate by ID, with fallback to default
     * @param id - Datasource identifier, or undefined/null for default
     * @returns The DataSourceDelegate (falls back to default if id not found)
     * @throws Error if neither the specified nor default datasource exists
     */
    getOrDefault(id: string | undefined | null): DataSourceDelegate;

    /**
     * Check if a datasource with the given ID exists
     */
    has(id: string): boolean;

    /**
     * List all registered datasource IDs
     */
    list(): string[];

    /**
     * Get the number of registered datasources
     */
    size(): number;
}

/**
 * Default implementation of DatasourceRegistry
 */
export class DefaultDatasourceRegistry implements DatasourceRegistry {
    private delegates = new Map<string, DataSourceDelegate>();

    /**
     * Create a DatasourceRegistry from either a single delegate or a map
     * @param input - Single DataSourceDelegate (maps to "(default)") or Record<string, DataSourceDelegate>
     */
    static create(
        input: DataSourceDelegate | Record<string, DataSourceDelegate>
    ): DefaultDatasourceRegistry {
        const registry = new DefaultDatasourceRegistry();

        if (isDataSourceDelegate(input)) {
            // Single delegate → register as "(default)"
            registry.register(DEFAULT_DATASOURCE_ID, input);
        } else {
            // Map of delegates → register each
            for (const [id, delegate] of Object.entries(input)) {
                registry.register(id, delegate);
            }
            // Ensure there's a default if not explicitly provided
            if (!registry.has(DEFAULT_DATASOURCE_ID) && registry.size() > 0) {
                // If no explicit "(default)", use the first one as default
                const firstId = Object.keys(input)[0];
                console.warn(
                    `[DatasourceRegistry] No "${DEFAULT_DATASOURCE_ID}" datasource provided. ` +
                    `Using "${firstId}" as the default.`
                );
                registry.register(DEFAULT_DATASOURCE_ID, input[firstId]);
            }
        }

        return registry;
    }

    register(id: string, delegate: DataSourceDelegate): void {
        if (this.delegates.has(id)) {
            console.warn(`[DatasourceRegistry] Overwriting datasource with id "${id}"`);
        }
        this.delegates.set(id, delegate);
    }

    getDefault(): DataSourceDelegate {
        const delegate = this.delegates.get(DEFAULT_DATASOURCE_ID);
        if (!delegate) {
            throw new Error(
                `[DatasourceRegistry] No default datasource registered. ` +
                `Register one with id "${DEFAULT_DATASOURCE_ID}" or pass a single DataSourceDelegate.`
            );
        }
        return delegate;
    }

    get(id: string | undefined | null): DataSourceDelegate | undefined {
        if (id === undefined || id === null) {
            return this.delegates.get(DEFAULT_DATASOURCE_ID);
        }
        return this.delegates.get(id);
    }

    getOrDefault(id: string | undefined | null): DataSourceDelegate {
        // If no ID specified, return default
        if (id === undefined || id === null) {
            return this.getDefault();
        }

        // Try to get by ID
        const delegate = this.delegates.get(id);
        if (delegate) {
            return delegate;
        }

        // Fallback to default with warning
        console.warn(
            `[DatasourceRegistry] Datasource "${id}" not found, falling back to "${DEFAULT_DATASOURCE_ID}"`
        );
        return this.getDefault();
    }

    has(id: string): boolean {
        return this.delegates.has(id);
    }

    list(): string[] {
        return Array.from(this.delegates.keys());
    }

    size(): number {
        return this.delegates.size;
    }
}

/**
 * Type guard to check if an object is a DataSourceDelegate
 */
function isDataSourceDelegate(obj: unknown): obj is DataSourceDelegate {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const delegate = obj as DataSourceDelegate;
    // Check for required DataSourceDelegate properties
    return (
        typeof delegate.key === "string" &&
        typeof delegate.fetchCollection === "function" &&
        typeof delegate.fetchEntity === "function" &&
        typeof delegate.saveEntity === "function" &&
        typeof delegate.deleteEntity === "function"
    );
}
