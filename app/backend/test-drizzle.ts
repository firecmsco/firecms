import { drizzle } from "drizzle-orm/node-postgres";
import pg from 'pg';
import { tables, relations as schemaRelations } from "./src/schema.generated.js";
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const schema = { ...tables, ...schemaRelations };
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function test() {
    try {
        console.log("Fetching posts WITHOUT author_profile in withConfig...");
        const res = await db.query.posts.findMany({
            with: { tags: { with: { tag_id: true } } }
        });
        console.log("SUCCESS, found matching rows:", res.length);
    } catch (e) {
        console.error("FAILED:", e.message);
    } finally {
        await pool.end();
    }
}
test();
