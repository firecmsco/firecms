import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { tables } from "./src/schema.generated.ts";
import { getTableName, Table } from "drizzle-orm";

// Note: Run from app/backend with DOTENV_CONFIG_PATH=../.env or ensure .env is in the app/ folder
// The parent package.json script should set this, or you can symlink/copy the .env

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Make sure .env file exists in the app/ folder and contains DATABASE_URL");
}

// Extract table names from the generated schema
// This ensures drizzle-kit ONLY manages tables defined in the schema and ignores all others
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
