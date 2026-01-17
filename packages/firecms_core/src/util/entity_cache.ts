import { isObject, isPlainObject } from "@firecms/common";
import { EntityReference, EntityRelation, GeoPoint, Vector } from "@firecms/types";

// Define a unique prefix for entity keys in sessionStorage to avoid key collisions
const LOCAL_STORAGE_PREFIX = "entity_cache::";

// In-memory cache to store entities for quick access
const entityCache: Map<string, object> = new Map();

// Check `sessionStorage` availability once during initialization
const isSessionStorageAvailable = typeof sessionStorage !== "undefined";

// Define custom replacer for JSON.stringify
function customReplacer(key: string): any {

    // @ts-ignore
    const value = this[key];

    // Handle Date objects
    // @ts-ignore
    if (value instanceof Date) {
        return {
            __type: "Date",
            value: value.toISOString()
        };
    }

    // Handle EntityReference
    // @ts-ignore
    if (value instanceof EntityReference) {
        return {
            __type: "EntityReference",
            id: value.id,
            path: value.path,
            datasource: value.datasource,
            database: value.database
        };
    }

    if (value instanceof EntityRelation) {
        return {
            __type: "EntityRelation",
            id: value.id,
            path: value.path
        };
    }

    // Handle GeoPoint
    // @ts-ignore
    if (value instanceof GeoPoint) {
        return {
            __type: "GeoPoint",
            latitude: value.latitude,
            longitude: value.longitude
        };
    }

    // Handle Vector
    // @ts-ignore
    if (value instanceof Vector) {
        return {
            __type: "Vector",
            value: value.value
        };
    }

    return value;
}

// Define custom reviver for JSON.parse
function customReviver(key: string, value: any): any {
    if (value && typeof value === "object" && "__type" in value) {
        switch (value.__type) {
            case "Date":
                return new Date(value.value);
            case "EntityReference":
                return new EntityReference({
                    id: value.id,
                    path: value.path,
                    datasource: value.datasource,
                    database: value.database
                });
            case "EntityRelation":
                return new EntityRelation(value.id, value.path);
            case "GeoPoint":
                return new GeoPoint(value.latitude, value.longitude);
            case "Vector":
                return new Vector(value.value);
            default:
                return value;
        }
    }
    return value;
}

// Initialize the in-memory cache by loading entities from `sessionStorage`
if (isSessionStorageAvailable) {
    try {
        // Iterate over all keys in sessionStorage to find those with the specified prefix
        for (let i = 0; i < sessionStorage.length; i++) {
            const fullKey = sessionStorage.key(i);
            if (fullKey && fullKey.startsWith(LOCAL_STORAGE_PREFIX)) {
                const path = fullKey.substring(LOCAL_STORAGE_PREFIX.length);
                const entityString = sessionStorage.getItem(fullKey);
                if (entityString) {
                    try {
                        const entity: object = JSON.parse(entityString, customReviver);
                        entityCache.set(path, entity);
                    } catch (parseError) {
                        console.error(
                            `Failed to parse entity for path "${path}" from sessionStorage:`,
                            parseError
                        );
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error accessing sessionStorage during initialization:", error);
    }
}

/**
 * Saves data to the in-memory cache and persists it individually in `sessionStorage`.
 * @param path - The unique path/key for the data.
 * @param data - The data to cache and persist.
 */
export function saveEntityToCache(path: string, data: object): void {
    // Persist the data individually in sessionStorage
    if (isSessionStorageAvailable) {
        try {
            const key = LOCAL_STORAGE_PREFIX + path;
            const entityString = JSON.stringify(data, customReplacer);
            sessionStorage.setItem(key, entityString);
        } catch (error) {
            console.error(
                `Failed to save entity for path "${path}" to sessionStorage:`,
                error
            );
        }
    }
}

export function removeEntityFromMemoryCache(path: string): void {
    entityCache.delete(path);
}

export function saveEntityToMemoryCache(path: string, data: object): void {
    entityCache.set(path, data);
}

export function getEntityFromMemoryCache(path: string): object | undefined {
    return entityCache.get(path);
}

export function hasEntityInCache(path: string): boolean {
    return entityCache.has(path);
}

/**
 * Retrieves an entity from the in-memory cache or `sessionStorage`.
 * If the entity is not in the cache but exists in `sessionStorage`, it loads it into the cache.
 * @param path - The unique path/key for the entity.
 * @returns The cached entity or `undefined` if not found.
 */
export function getEntityFromCache(path: string): object | undefined {

    // If not in the cache, attempt to load it from sessionStorage
    if (isSessionStorageAvailable) {
        try {
            const key = LOCAL_STORAGE_PREFIX + path;
            const entityString = sessionStorage.getItem(key);
            if (entityString) {
                const entity: object = JSON.parse(entityString, customReviver);
                return entity;
            }
        } catch (error) {
            console.error(
                `Failed to load entity for path "${path}" from sessionStorage:`,
                error
            );
        }
    }

    // Entity not found
    return undefined;
}

/**
 * Removes an entity from both the in-memory cache and `sessionStorage`.
 * @param path - The unique path/key for the entity to remove.
 */
export function removeEntityFromCache(path: string): void {

    console.debug("Removing entity from cache", path);

    // Remove from the in-memory cache
    entityCache.delete(path);

    // Remove from sessionStorage
    if (isSessionStorageAvailable) {
        try {
            const key = LOCAL_STORAGE_PREFIX + path;
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error(
                `Failed to remove entity for path "${path}" from sessionStorage:`,
                error
            );
        }
    }
}

/**
 * Clears the entire in-memory cache and removes all related entities from `sessionStorage`.
 */
export function clearEntityCache(): void {
    // Clear the in-memory cache
    entityCache.clear();

    // Remove all entities with the specified prefix from sessionStorage
    if (isSessionStorageAvailable) {
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const fullKey = sessionStorage.key(i);
                if (fullKey && fullKey.startsWith(LOCAL_STORAGE_PREFIX)) {
                    keysToRemove.push(fullKey);
                }
            }

            // Remove the keys after collecting them to avoid issues while iterating
            keysToRemove.forEach((key) => sessionStorage.removeItem(key));
        } catch (error) {
            console.error("Failed to clear entity cache from sessionStorage:", error);
        }
    }
}

export function flattenKeys(obj: any, prefix = "", result: string[] = []): string[] {

    if (isObject(obj) || Array.isArray(obj)) {
        const plainObject = isPlainObject(obj);
        if (!plainObject && prefix) {
            result.push(prefix);
        } else {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const newKey = prefix
                        ? Array.isArray(obj)
                            ? `${prefix}[${key}]`
                            : `${prefix}.${key}`
                        : key;
                    if (isObject(obj[key]) || Array.isArray(obj[key])) {
                        flattenKeys(obj[key], newKey, result);
                    } else {
                        result.push(newKey);
                    }
                }
            }
        }
    }
    return result;
}
