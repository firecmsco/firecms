/**
 * Driver Registry
 *
 * Manages multiple driver delegates for Rebase backend.
 * Allows different databases for different collections.
 *
 * Usage:
 * - Single DB: Pass a single DataDriver → maps to "(default)"
 * - Multiple DBs: Pass a map of { dbId: DataDriver }
 * - Collections use `databaseId` property to specify which driver to use
 * - Collections without `databaseId` fallback to "(default)"
 */

import { DataDriver } from "@rebasepro/types";

/**
 * The default driver identifier used when:
 * - A single driver is provided (not a map)
 * - A collection doesn't specify a databaseId
 */
export const DEFAULT_DRIVER_ID = "(default)";

/**
 * Registry for managing multiple driver delegates
 */
export interface DriverRegistry {
    /**
     * Register a driver delegate with an ID
     * @param id - Unique identifier for this driver (e.g., "analytics", "users")
     * @param delegate - The DataDriver instance
     */
    register(id: string, delegate: DataDriver): void;

    /**
     * Get the default driver delegate (id = "(default)")
     * @throws Error if no default driver is registered
     */
    getDefault(): DataDriver;

    /**
     * Get a driver delegate by ID
     * @param id - Driver identifier, or undefined/null for default
     * @returns The DataDriver, or undefined if not found
     */
    get(id: string | undefined | null): DataDriver | undefined;

    /**
     * Get a driver delegate by ID, with fallback to default
     * @param id - Driver identifier, or undefined/null for default
     * @returns The DataDriver (falls back to default if id not found)
     * @throws Error if neither the specified nor default driver exists
     */
    getOrDefault(id: string | undefined | null): DataDriver;

    /**
     * Check if a driver with the given ID exists
     */
    has(id: string): boolean;

    /**
     * List all registered driver IDs
     */
    list(): string[];

    /**
     * Get the number of registered drivers
     */
    size(): number;
}

/**
 * Default implementation of DriverRegistry
 */
export class DefaultDriverRegistry implements DriverRegistry {
    private delegates = new Map<string, DataDriver>();

    /**
     * Create a DriverRegistry from either a single delegate or a map
     * @param input - Single DataDriver (maps to "(default)") or Record<string, DataDriver>
     */
    static create(
        input: DataDriver | Record<string, DataDriver>
    ): DefaultDriverRegistry {
        const registry = new DefaultDriverRegistry();

        if (isDataDriverDelegate(input)) {
            // Single delegate → register as "(default)"
            registry.register(DEFAULT_DRIVER_ID, input);
        } else {
            // Map of delegates → register each
            for (const [id, delegate] of Object.entries(input)) {
                registry.register(id, delegate);
            }
            // Ensure there's a default if not explicitly provided
            if (!registry.has(DEFAULT_DRIVER_ID) && registry.size() > 0) {
                // If no explicit "(default)", use the first one as default
                const firstId = Object.keys(input)[0];
                console.warn(
                    `[DriverRegistry] No "${DEFAULT_DRIVER_ID}" driver provided. ` +
                    `Using "${firstId}" as the default.`
                );
                registry.register(DEFAULT_DRIVER_ID, input[firstId]);
            }
        }

        return registry;
    }

    register(id: string, delegate: DataDriver): void {
        if (this.delegates.has(id)) {
            console.warn(`[DriverRegistry] Overwriting driver with id "${id}"`);
        }
        this.delegates.set(id, delegate);
    }

    getDefault(): DataDriver {
        const delegate = this.delegates.get(DEFAULT_DRIVER_ID);
        if (!delegate) {
            throw new Error(
                `[DriverRegistry] No default driver registered. ` +
                `Register one with id "${DEFAULT_DRIVER_ID}" or pass a single DataDriver.`
            );
        }
        return delegate;
    }

    get(id: string | undefined | null): DataDriver | undefined {
        if (id === undefined || id === null) {
            return this.delegates.get(DEFAULT_DRIVER_ID);
        }
        return this.delegates.get(id);
    }

    getOrDefault(id: string | undefined | null): DataDriver {
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
            `[DriverRegistry] Driver "${id}" not found, falling back to "${DEFAULT_DRIVER_ID}"`
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
 * Type guard to check if an object is a DataDriver
 */
function isDataDriverDelegate(obj: unknown): obj is DataDriver {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const delegate = obj as DataDriver;
    // Check for required DataDriver properties
    return (
        typeof delegate.key === "string" &&
        typeof delegate.fetchCollection === "function" &&
        typeof delegate.fetchEntity === "function" &&
        typeof delegate.saveEntity === "function" &&
        typeof delegate.deleteEntity === "function"
    );
}
