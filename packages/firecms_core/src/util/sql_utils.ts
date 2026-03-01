import { parseFirst } from "pgsql-ast-parser";
import { TableInfo } from "../components/SQLEditor/SQLEditor";

export function determineTableAndPK(sqlString: string, columnKey: string, schemas: Record<string, TableInfo[]>) {
    try {
        const ast = parseFirst(sqlString);
        if (ast.type !== "select") {
            return { error: "Inline editing is only supported for SELECT queries." };
        }

        // Find all tables in the FROM clause
        const tables: { name: string, alias?: string }[] = [];

        const processFrom = (fromItems: any[]) => {
            for (const item of fromItems) {
                if (item.type === "table") {
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

        if (tables.length === 0) {
            return { error: "Could not find any tables in the query." };
        }

        let resolvedTableName: string | null = null;

        if (tables.length === 1) {
            resolvedTableName = tables[0].name;
        } else {
            const matchedTables = tables.filter(t => {
                for (const schema of Object.values(schemas)) {
                    const tableInfo = schema.find(tableInfo => tableInfo.tableName === t.name);
                    if (tableInfo && tableInfo.columns.some(c => c.name === columnKey)) {
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

        if (resolvedTableName) {
            for (const schema of Object.values(schemas)) {
                const tableInfo = schema.find(t => t.tableName === resolvedTableName);
                if (tableInfo) {
                    const pkColumn = tableInfo.columns.find(c => c.name === 'id'); // For now, assuming 'id' is standard. Can be improved.
                    if (pkColumn) {
                        return { tableName: resolvedTableName, primaryKey: "id" };
                    } else {
                        return { error: `Table "${resolvedTableName}" does not have an "id" column to use as a primary key.` };
                    }
                }
            }
            return { tableName: resolvedTableName, primaryKey: "id" };
        }

        return { error: "Could not resolve the target table." };
    } catch (e: any) {
        console.warn("Failed to parse SQL AST:", e);
        return { error: `Could not safely parse query for inline editing: ${e.message}` };
    }
}
