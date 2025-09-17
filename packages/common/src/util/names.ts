import { toSnakeCase } from "./strings";

/**
 * Generates a foreign key column name from a given string, typically a collection slug or name.
 * It converts the name to snake_case, attempts to singularize it by removing a trailing 's'
 * (a common convention for collection names), and appends '_id'.
 *
 * @param name The base name to convert to a foreign key.
 * @returns A foreign key name in the format 'singular_name_id'.
 *
 * @example
 * // returns "user_id"
 * generateForeignKeyName("users")
 *
 * @example
 * // returns "post_id"
 * generateForeignKeyName("posts")
 *
 * @example
 * // returns "product_id"
 * generateForeignKeyName("Product")
 *
 */
export function generateForeignKeyName(name: string): string {
    const snakeCaseName = toSnakeCase(name);
    // A simple heuristic to singularize a plural name, which is a common convention.
    const singularName = snakeCaseName.endsWith("s") ? snakeCaseName.slice(0, -1) : snakeCaseName;
    return `${singularName}_id`;
}

