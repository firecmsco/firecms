import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "@firecms/backend";

async function runMigrations() {
    console.log("🔄 Running database migrations...");

    try {
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("✅ Migrations completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

runMigrations();
