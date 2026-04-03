import { PgTable, AnyPgColumn } from "drizzle-orm/pg-core";
import { EntityCollection, Property } from "@rebasepro/types";
import { BackendCollectionRegistry } from "../../collections/BackendCollectionRegistry";

/**
 * Shared helper functions for entity operations.
 * These are used by EntityFetchService, EntityPersistService, and RelationService.
 *
 * All functions that need collection/table lookups require an explicit
 * `BackendCollectionRegistry` instance — there is no global singleton.
 */

export function getCollectionByPath(collectionPath: string, registry: BackendCollectionRegistry): EntityCollection {
    const collection = registry.getCollectionByPath(collectionPath);
    if (!collection) {
        throw new Error(`Collection not found: ${collectionPath}`);
    }
    return collection;
}

export function getTableForCollection(collection: EntityCollection, registry: BackendCollectionRegistry): PgTable<any> {
    const table = registry.getTable(collection.dbPath);
    if (!table) {
        throw new Error(`Table not found for dbPath: ${collection.dbPath}`);
    }
    return table;
}

export function getPrimaryKeys(collection: EntityCollection, registry: BackendCollectionRegistry): { fieldName: string; type: "string" | "number" }[] {
    const table = getTableForCollection(collection, registry);

    // Fallback to explicitly defined isId properties
    if (collection.properties) {
        const idProps = Object.entries(collection.properties)
            .filter(([_, prop]) => "isId" in (prop as object) && Boolean((prop as unknown as Record<string, unknown>).isId))
            .map(([key, prop]) => ({
                fieldName: key,
                type: prop.type === "number" ? "number" as const : "string" as const
            }));

        if (idProps.length > 0) {
            return idProps;
        }
    }

    // Otherwise infer from Drizzle schema
    const keys: { fieldName: string; type: "string" | "number" }[] = [];
    for (const [key, colRaw] of Object.entries(table)) {
        const col = colRaw as AnyPgColumn;
        if (col && typeof col === "object" && "primary" in col && col.primary) {
            const type = col.dataType === "number" || (col as unknown as Record<string, unknown>).columnType === "PgSerial" || (col as unknown as Record<string, unknown>).columnType === "PgInteger" ? "number" : "string";
            keys.push({ fieldName: key, type });
        }
    }

    // Default to 'id' if no primary keys are found and it exists in the schema
    // This maintains backwards compatibility
    if (keys.length === 0 && "id" in table) {
        const idCol = table["id" as keyof typeof table] as AnyPgColumn;
        const type = idCol.dataType === "number" || (idCol as unknown as Record<string, unknown>).columnType === "PgSerial" || (idCol as unknown as Record<string, unknown>).columnType === "PgInteger" ? "number" : "string";
        keys.push({ fieldName: "id", type });
    }

    return keys;
}

export function parseIdValues(idValue: string | number, primaryKeys: { fieldName: string; type: "string" | "number" }[]): Record<string, string | number> {
    const result: Record<string, string | number> = {};

    if (primaryKeys.length === 0) {
        return result;
    }

    if (primaryKeys.length === 1) {
        const pk = primaryKeys[0];
        if (pk.type === "number") {
            const parsed = typeof idValue === "number" ? idValue : parseInt(String(idValue), 10);
            if (isNaN(parsed)) {
                throw new Error(`Invalid numeric ID: ${idValue}`);
            }
            result[pk.fieldName] = parsed;
        } else {
            result[pk.fieldName] = String(idValue);
        }
        return result;
    }

    // Composite key - split by :::
    const parts = String(idValue).split(":::");
    if (parts.length !== primaryKeys.length) {
        throw new Error(`Composite ID parts mismatch. Expected ${primaryKeys.length}, got ${parts.length} for ID: ${idValue}`);
    }

    for (let i = 0; i < primaryKeys.length; i++) {
        const pk = primaryKeys[i];
        const val = parts[i];
        if (pk.type === "number") {
            const parsed = parseInt(val, 10);
            if (isNaN(parsed)) {
                throw new Error(`Invalid numeric ID component: ${val}`);
            }
            result[pk.fieldName] = parsed;
        } else {
            result[pk.fieldName] = val;
        }
    }

    return result;
}

export function buildCompositeId(values: Record<string, any>, primaryKeys: { fieldName: string; type: "string" | "number" }[]): string {
    if (primaryKeys.length === 0) {
        return "";
    }
    if (primaryKeys.length === 1) {
        return String(values[primaryKeys[0].fieldName] ?? "");
    }
    return primaryKeys.map(pk => String(values[pk.fieldName] ?? "")).join(":::");
}
