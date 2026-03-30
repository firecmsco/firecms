import { parseFirst } from "pgsql-ast-parser";
import { TableInfo } from "../components/SQLEditor/SQLEditor";
import { EntityCollection } from "@rebasepro/types";

/**
 * A table extracted from a SQL query's FROM/JOIN clauses.
 */
export interface ExtractedTable {
    name: string;
    alias?: string;
}

/**
 * A CMS collection matched to a table in a SQL query.
 */
export interface ResolvedQueryCollection {
    /** DB table name from the SQL AST (e.g. "blog_posts") */
    tableName: string;
    /** SQL alias if present (e.g. "bp") */
    tableAlias?: string;
    /** The matched CMS collection */
    collection: EntityCollection;
    /** Columns from this table that are present in the result set */
    columns: string[];
    /** The result column name that holds the primary key for this table (e.g. "id", "author_id") */
    pkColumn?: string;
}

/**
 * Extract all tables referenced in a SQL query's FROM and JOIN clauses.
 * Returns an empty array for non-SELECT queries or parse failures.
 */
export function extractTablesFromQuery(sqlString: string): ExtractedTable[] {
    try {
        const ast = parseFirst(sqlString);
        if (ast.type !== "select") return [];

        const tables: ExtractedTable[] = [];

        // pgsql-ast-parser From items — tables and joins with left/right branches
        type FromNode = { type: string; name?: { name: string; alias?: string }; left?: FromNode; right?: FromNode };
        const processFrom = (fromItems: FromNode[]) => {
            for (const item of fromItems) {
                if (item.type === "table" && item.name) {
                    tables.push({ name: item.name.name, alias: item.name.alias });
                }
                if (item.type === "join") {
                    if (item.left) processFrom([item.left]);
                    if (item.right) processFrom([item.right]);
                }
            }
        };

        if (ast.from) {
            processFrom(ast.from);
        }

        return tables;
    } catch {
        return [];
    }
}

/**
 * Convert a slug like "blogPosts" or "blog-posts" to snake_case "blog_posts".
 */
function slugToSnakeCase(slug: string): string {
    return slug
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[-\s]+/g, "_")
        .toLowerCase();
}

/**
 * Resolve which CMS collections are referenced by a SQL query.
 *
 * Parses the SQL, extracts table names, and matches each against
 * registered collections via `collection.dbPath` (falling back to
 * snake_case of `collection.slug`).
 *
 * For each matched collection, determines which result columns
 * belong to that table using the database schema information.
 */
export function resolveQueryCollections(
    sqlString: string,
    schemas: Record<string, TableInfo[]>,
    collections: EntityCollection[],
    resultColumns?: string[]
): ResolvedQueryCollection[] {
    const tables = extractTablesFromQuery(sqlString);
    if (tables.length === 0) return [];

    // Parse the AST to resolve SELECT column aliases
    let selectColumns: { table?: string; column: string; alias?: string }[] = [];
    try {
        const ast = parseFirst(sqlString);
        if (ast.type === "select" && ast.columns) {
            for (const col of ast.columns) {
                if (col.expr?.type === "ref") {
                    selectColumns.push({
                        table: col.expr.table?.name,
                        column: col.expr.name,
                        alias: col.alias?.name
                    });
                }
            }
        }
    } catch { /* parse failure is ok, we'll fall back */ }

    const results: ResolvedQueryCollection[] = [];

    for (const table of tables) {
        // Match table name against collection dbPath or slug->snake_case
        const matched = collections.find(c => {
            const dbPath = c.dbPath || slugToSnakeCase(c.slug);
            return dbPath === table.name;
        });

        if (!matched) continue;

        // Find columns belonging to this table from the schema
        const tableColumns: string[] = [];
        for (const schemaEntries of Object.values(schemas)) {
            const tableInfo = schemaEntries.find(t => t.tableName === table.name);
            if (tableInfo) {
                tableColumns.push(...tableInfo.columns.map(c => c.name));
                break;
            }
        }

        // Determine which result column holds the PK ("id") for this table.
        // 1. Check parsed SELECT columns for an explicit "id" column from this table (by name or alias)
        // 2. Fall back to checking if result columns contain "id"
        let pkColumn: string | undefined;

        // Look in the AST select columns for `table.id` or `alias.id`
        const tableRef = table.alias || table.name;
        const idSelectCol = selectColumns.find(
            sc => sc.column === "id" && (!sc.table || sc.table === tableRef || sc.table === table.name)
        );
        if (idSelectCol) {
            pkColumn = idSelectCol.alias || idSelectCol.column; // use alias if present
        }

        // If we didn't find it from the AST (e.g. SELECT *), check if result columns have "id"
        if (!pkColumn && resultColumns) {
            if (resultColumns.includes("id")) {
                pkColumn = "id";
            }
        }

        // If still not found, fall back to checking tableColumns
        if (!pkColumn && tableColumns.includes("id")) {
            pkColumn = "id";
        }

        results.push({
            tableName: table.name,
            tableAlias: table.alias,
            collection: matched,
            columns: tableColumns,
            pkColumn
        });
    }

    return results;
}

export interface PKMapping {
    /** The actual column name in the database table */
    dbColumn: string;
    /** The column name as it appears in the query result set (may be aliased) */
    resultColumn: string;
}

export interface TableAndPKResult {
    tableName?: string;
    primaryKeys?: PKMapping[];
    error?: string;
}

export function determineTableAndPK(sqlString: string, columnKey: string, schemas: Record<string, TableInfo[]>): TableAndPKResult {
    try {
        const tables = extractTablesFromQuery(sqlString);

        const ast = parseFirst(sqlString);
        if (ast.type !== "select") {
            return { error: "Inline editing is only supported for SELECT queries." };
        }

        if (tables.length === 0) {
            return { error: "Could not find any tables in the query." };
        }

        // Parse SELECT columns to resolve aliases
        const selectColumns: { table?: string; column: string; alias?: string }[] = [];
        if (ast.columns) {
            for (const col of ast.columns) {
                if (col.expr?.type === "ref") {
                    selectColumns.push({
                        table: col.expr.table?.name,
                        column: col.expr.name,
                        alias: col.alias?.name
                    });
                }
            }
        }

        // Resolve which DB column `columnKey` refers to (it might be aliased)
        const resolvedColumn = selectColumns.find(
            sc => (sc.alias === columnKey) || (!sc.alias && sc.column === columnKey)
        );
        const actualDbColumnName = resolvedColumn?.column ?? columnKey;
        const columnTableRef = resolvedColumn?.table; // e.g. "p" or "posts"

        // Resolve the table for the edited column
        let resolvedTableName: string | null = null;

        if (tables.length === 1) {
            resolvedTableName = tables[0].name;
        } else {
            // If the AST tells us which table, use that
            if (columnTableRef) {
                const matchedTable = tables.find(
                    t => t.alias === columnTableRef || t.name === columnTableRef
                );
                if (matchedTable) {
                    resolvedTableName = matchedTable.name;
                }
            }

            // Otherwise, look up which schema table has this column
            if (!resolvedTableName) {
                const matchedTables = tables.filter(t => {
                    for (const schema of Object.values(schemas)) {
                        const tableInfo = schema.find(ti => ti.tableName === t.name);
                        if (tableInfo && tableInfo.columns.some(c => c.name === actualDbColumnName)) {
                            return true;
                        }
                    }
                    return false;
                });

                if (matchedTables.length === 1) {
                    resolvedTableName = matchedTables[0].name;
                } else if (matchedTables.length > 1) {
                    return { error: `Ambiguous column "${columnKey}": Found in multiple queried tables.` };
                } else {
                    return { error: `Could not find column "${columnKey}" in the queried tables.` };
                }
            }
        }

        if (!resolvedTableName) {
            return { error: "Could not resolve the target table." };
        }

        // Find the table's actual primary key columns from the schema
        let pkDbColumns: string[] = [];
        for (const schema of Object.values(schemas)) {
            const tableInfo = schema.find(t => t.tableName === resolvedTableName);
            if (tableInfo) {
                pkDbColumns = tableInfo.columns
                    .filter(c => c.isPrimaryKey)
                    .map(c => c.name);
                break;
            }
        }

        if (pkDbColumns.length === 0) {
            return { error: `Table "${resolvedTableName}" has no primary key defined.` };
        }

        // Find the table's alias in the query (for resolving PK result column names)
        const tableEntry = tables.find(t => t.name === resolvedTableName);
        const tableAlias = tableEntry?.alias;

        // Map each PK db column to its result column name (resolving aliases)
        const primaryKeys: PKMapping[] = pkDbColumns.map(dbCol => {
            // Find the SELECT column for this PK
            const selectCol = selectColumns.find(
                sc => sc.column === dbCol &&
                    (!sc.table || sc.table === (tableAlias || resolvedTableName))
            );
            return {
                dbColumn: dbCol,
                resultColumn: selectCol?.alias || selectCol?.column || dbCol
            };
        });

        return { tableName: resolvedTableName, primaryKeys };
    } catch (e: unknown) {
        console.warn("Failed to parse SQL AST:", e);
        const message = e instanceof Error ? e.message : String(e);
        return { error: `Could not safely parse query for inline editing: ${message}` };
    }
}
