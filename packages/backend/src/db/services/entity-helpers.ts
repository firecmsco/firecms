import { PgTable } from "drizzle-orm/pg-core";
import { EntityCollection, Property } from "@firecms/types";
import { collectionRegistry } from "../../collections/registry";

/**
 * Shared helper functions for entity operations.
 * These are used by EntityFetchService, EntityPersistService, and RelationService.
 */

export function getCollectionByPath(collectionPath: string): EntityCollection {
    const collection = collectionRegistry.getCollectionByPath(collectionPath);
    if (!collection) {
        throw new Error(`Collection not found: ${collectionPath}`);
    }
    return collection;
}

export function getTableForCollection(collection: EntityCollection): PgTable<any> {
    const table = collectionRegistry.getTable(collection.dbPath);
    if (!table) {
        throw new Error(`Table not found for dbPath: ${collection.dbPath}`);
    }
    return table;
}

export function getIdFieldInfo(collection: EntityCollection): { fieldName: string; type: string } {
    const idFieldName = collection.idField ?? "id";
    const idFieldConfig = collection.properties[idFieldName] as Property;

    if (!idFieldConfig) {
        throw new Error(`ID field '${idFieldName}' not found in properties for collection '${collection.slug || collection.dbPath}'`);
    }

    return {
        fieldName: idFieldName,
        type: idFieldConfig.type
    };
}

export function parseIdValue(idValue: string | number, idType: string): string | number {
    if (idType === "number") {
        if (typeof idValue === "number") {
            return idValue;
        }

        const parsed = parseInt(String(idValue), 10);
        if (isNaN(parsed)) {
            throw new Error(`Invalid numeric ID: ${idValue}`);
        }
        return parsed;
    } else if (idType === "string") {
        return String(idValue);
    } else {
        throw new Error(`Unsupported ID type: ${idType}`);
    }
}

export function generateEntityId(): string {
    return Date.now().toString() + Math.random().toString(36).substring(2, 7);
}

export { collectionRegistry };
