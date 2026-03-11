import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

async function test() {
    const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/postgres' });
    const db = drizzle(pool);
    // Ignore econnrefused, let's just inspect the type of $client on db without connecting if possible?
    // Actually connect is required to start a tx.
    try {
        await db.transaction(async (tx) => {
            console.log("TX keys: ", Object.keys(tx));
            console.log("TX $client: ", (tx as any).$client ? "exists" : "undefined");
            console.log("TX session client: ", (tx as any).session?.client ? "exists" : "undefined");
        });
    } catch(e) { }
}
test();
