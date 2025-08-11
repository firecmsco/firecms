import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

export function createPostgresDatabaseConnection(connectionString: string) {
    const pool = new Pool({
        connectionString
    });

    return drizzle(pool);
}

