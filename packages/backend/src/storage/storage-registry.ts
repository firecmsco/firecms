/**
 * Storage Registry
 *
 * Manages multiple storage controllers for FireCMS backend.
 * Allows different storage backends for different use cases.
 *
 * Usage:
 * - Single storage: Pass a single StorageController → maps to "(default)"
 * - Multiple storages: Pass a map of { storageId: StorageController }
 * - String properties use `storageId` in their config to specify which storage to use
 * - Properties without `storageId` fallback to "(default)"
 */

import { StorageController } from "./types";

/**
 * The default storage identifier used when:
 * - A single storage controller is provided (not a map)
 * - A property doesn't specify a storageId
 */
export const DEFAULT_STORAGE_ID = "(default)";

/**
 * Registry for managing multiple storage controllers
 */
export interface StorageRegistry {
    /**
     * Register a storage controller with an ID
     * @param id - Unique identifier for this storage (e.g., "media", "backups")
     * @param controller - The StorageController instance
     */
    register(id: string, controller: StorageController): void;

    /**
     * Get the default storage controller (id = "(default)")
     * @throws Error if no default storage is registered
     */
    getDefault(): StorageController;

    /**
     * Get a storage controller by ID
     * @param id - Storage identifier, or undefined/null for default
     * @returns The StorageController, or undefined if not found
     */
    get(id: string | undefined | null): StorageController | undefined;

    /**
     * Get a storage controller by ID, with fallback to default
     * @param id - Storage identifier, or undefined/null for default
     * @returns The StorageController (falls back to default if id not found)
     * @throws Error if neither the specified nor default storage exists
     */
    getOrDefault(id: string | undefined | null): StorageController;

    /**
     * Check if a storage with the given ID exists
     */
    has(id: string): boolean;

    /**
     * List all registered storage IDs
     */
    list(): string[];

    /**
     * Get the number of registered storage controllers
     */
    size(): number;
}

/**
 * Default implementation of StorageRegistry
 */
export class DefaultStorageRegistry implements StorageRegistry {
    private controllers = new Map<string, StorageController>();

    /**
     * Create a StorageRegistry from either a single controller or a map
     * @param input - Single StorageController (maps to "(default)") or Record<string, StorageController>
     */
    static create(
        input: StorageController | Record<string, StorageController>
    ): DefaultStorageRegistry {
        const registry = new DefaultStorageRegistry();

        if (isStorageController(input)) {
            // Single controller → register as "(default)"
            registry.register(DEFAULT_STORAGE_ID, input);
        } else {
            // Map of controllers → register each
            for (const [id, controller] of Object.entries(input)) {
                if (isStorageController(controller)) {
                    registry.register(id, controller);
                }
            }
            // Ensure there's a default if not explicitly provided
            if (!registry.has(DEFAULT_STORAGE_ID) && registry.size() > 0) {
                // If no explicit "(default)", use the first one as default
                const firstId = Object.keys(input).find(k => isStorageController(input[k]));
                if (firstId) {
                    console.warn(
                        `[StorageRegistry] No "${DEFAULT_STORAGE_ID}" storage provided. ` +
                        `Using "${firstId}" as the default.`
                    );
                    registry.register(DEFAULT_STORAGE_ID, input[firstId]);
                }
            }
        }

        return registry;
    }

    register(id: string, controller: StorageController): void {
        if (this.controllers.has(id)) {
            console.warn(`[StorageRegistry] Overwriting storage with id "${id}"`);
        }
        this.controllers.set(id, controller);
    }

    getDefault(): StorageController {
        const controller = this.controllers.get(DEFAULT_STORAGE_ID);
        if (!controller) {
            throw new Error(
                `[StorageRegistry] No default storage registered. ` +
                `Register one with id "${DEFAULT_STORAGE_ID}" or pass a single StorageController.`
            );
        }
        return controller;
    }

    get(id: string | undefined | null): StorageController | undefined {
        if (id === undefined || id === null) {
            return this.controllers.get(DEFAULT_STORAGE_ID);
        }
        return this.controllers.get(id);
    }

    getOrDefault(id: string | undefined | null): StorageController {
        // If no ID specified, return default
        if (id === undefined || id === null) {
            return this.getDefault();
        }

        // Try to get by ID
        const controller = this.controllers.get(id);
        if (controller) {
            return controller;
        }

        // Fallback to default with warning
        console.warn(
            `[StorageRegistry] Storage "${id}" not found, falling back to "${DEFAULT_STORAGE_ID}"`
        );
        return this.getDefault();
    }

    has(id: string): boolean {
        return this.controllers.has(id);
    }

    list(): string[] {
        return Array.from(this.controllers.keys());
    }

    size(): number {
        return this.controllers.size;
    }
}

/**
 * Type guard to check if an object is a StorageController
 * vs a Record<string, StorageController> (multiple storages)
 */
function isStorageController(obj: unknown): obj is StorageController {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const controller = obj as StorageController;
    // Check for required StorageController properties
    return (
        typeof controller.uploadFile === "function" &&
        typeof controller.getDownloadURL === "function" &&
        typeof controller.deleteFile === "function" &&
        typeof controller.list === "function" &&
        typeof controller.getType === "function"
    );
}
