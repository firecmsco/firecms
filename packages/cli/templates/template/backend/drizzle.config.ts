import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { tables } from "./src/schema.generated";
import { getTableName, Table } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Make sure .env file exists in the project root and contains DATABASE_URL");
}

// Extract table names from the generated schema
// This ensures drizzle-kit ONLY manages tables defined in the schema
const tableNames = Object.values(tables).map(table => getTableName(table as Table));

export default defineConfig({
    schema: "./src/schema.generated.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL
    },
    tablesFilter: tableNames
});
