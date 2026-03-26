import { Client } from "pg";
import { buildCollectionFromTableColumns, TableColumnInfo } from "./packages/studio/src/utils/pgColumnToProperty.ts";

const connectionString = "postgresql://postgres:A%3FCl8L%5DpUHiO%3A%5COT@34.22.208.81:5432/firecms";

async function fetchTableColumns(client: Client, tableName: string): Promise<TableColumnInfo[]> {
    const safeName = tableName.replace(/[^a-zA-Z0-9_]/g, "");

    const res = await client.query(`
        SELECT column_name, data_type, udt_name, is_nullable, column_default, character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position;
    `, [safeName]);

    const columns: TableColumnInfo[] = res.rows;

    const enumColumns = columns.filter(c => c.data_type === "USER-DEFINED");
    if (enumColumns.length > 0) {
        for (const col of enumColumns) {
            try {
                const enumRes = await client.query(`
                    SELECT e.enumlabel
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    WHERE t.typname = $1
                    ORDER BY e.enumsortorder;
                `, [col.udt_name]);
                col.enum_values = enumRes.rows.map(e => e.enumlabel);
            } catch (e) {
                col.enum_values = [];
            }
        }
    }

    return columns;
}

async function main() {
    const client = new Client({ connectionString });
    await client.connect();
    
    console.log("=== INFERRING COLLECTIONS FROM REAL DATABASE ===");

    const tables = ["posts", "authors", "profiles", "tags"];
    
    for (const table of tables) {
        console.log(`\\n--- ${table.toUpperCase()} ---`);
        try {
            const columns = await fetchTableColumns(client, table);
            if (columns.length === 0) {
                console.log(`Table '${table}' not found in database or has no columns.`);
            } else {
                const collection = buildCollectionFromTableColumns(table, columns);
                console.dir(collection, { depth: null });
            }
        } catch (e) {
            console.error(`Error processing table ${table}:`, e);
        }
    }
    
    await client.end();
}

main().catch(console.error);
