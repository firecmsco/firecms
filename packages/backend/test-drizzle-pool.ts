import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

const pool = new Pool({ connectionString: "postgresql://postgres:pass@localhost/db" });
const db = drizzle(pool);

console.log(db);
console.log(Object.keys(db));
console.log(db.session);
let currentObj = db;
// let's just print keys of session
console.log(Object.keys((db as any).session || {}));
console.log((db as any).session.client?.options?.connectionString);
console.log((db as any).session.client?.connectionParameters);
