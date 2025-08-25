import { EntityCollection } from "@firecms/types";

/**
 * Converts a camelCase or PascalCase string to snake_case.
 * @param str The string to convert.
 * @returns The snake_cased string.
 */
export function toSnakeCase(str: string): string {
    if (!str) return "";
    return str.replace(/[A-Z]/g, (letter, index) =>
        index === 0 ? letter.toLowerCase() : `_${letter.toLowerCase()}`
    );
}

/**
 * Gets the table name from a collection, following the same logic in both files
 * @param collection The entity collection
 * @returns The table name
 */
export function getTableName(collection: EntityCollection): string {
    return collection.dbPath ?? toSnakeCase(collection.slug) ?? toSnakeCase(collection.name);
}

/**
 * Gets the table name from a collection object (compatible with both EntityCollection and generic collection objects)
 * @param collection The collection object
 * @returns The table name
 */
export function getTableNameFromCollection(collection: any): string {
    return (collection.dbPath ?? toSnakeCase(collection.slug ?? "")) || toSnakeCase(collection.name ?? "");
}

/**
 * Resolves the junction table name for many-to-many relationships
 * @param through Optional through configuration with dbPath
 * @param sourceCollection The source collection
 * @param targetCollection The target collection
 * @returns The junction table name
 */
export function resolveJunctionTableName(
    through: { dbPath?: string } | undefined,
    sourceCollection: any,
    targetCollection: any
): string {
    if (through?.dbPath) return through.dbPath;
    const sourceName = getTableNameFromCollection(sourceCollection);
    const targetName = getTableNameFromCollection(targetCollection);
    // Sort names to ensure consistent table name regardless of relation direction
    return [sourceName, targetName].sort().join("_");
}

/**
 * Generates a Drizzle-friendly variable name from a table name.
 * @param tableName The name of the table.
 * @returns A variable-safe name in camelCase.
 */
export function getTableVarName(tableName: string): string {
    // Convert snake_case to camelCase for table variable names
    return tableName.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

/**
 * Resolves a target table name that can be a string or a function returning an EntityCollection
 * @param target The target reference
 * @returns The resolved table name
 */
export function resolveTargetTableName(target: string | (() => EntityCollection)): string {
    if (typeof target === "function") {
        const col = target();
        return getTableName(col);
    }
    return target;
}

/**
 * Converts table name and property name to camelCase enum variable name
 * @param tableName The name of the table.
 * @param propName The property name.
 * @returns A camelCase enum variable name.
 */
export function getEnumVarName(tableName: string, propName: string): string {
    const tableVar = getTableVarName(tableName);
    const propVar = propName.charAt(0).toUpperCase() + propName.slice(1);
    return `${tableVar}${propVar}`;
}
