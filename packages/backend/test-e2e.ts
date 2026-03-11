import { Pool } from 'pg';
import { PostgresDataSource } from './src/services/postgresDataSource';
import { EntityService } from './src/db/entityService';
import { RealtimeService } from './src/services/realtimeService';
import { drizzle } from 'drizzle-orm/node-postgres';

async function test() {
    const pool = new Pool({ connectionString: 'postgres://postgres:postgres@localhost:5432/postgres' });
    const db = drizzle(pool);
    const ds = new PostgresDataSource(db, new RealtimeService(db as any));
    ds['entityService'] = new EntityService(db);
    
    console.log("Root Cxn URL parsed on init:", ds.rootConnectionString);
    
    // Simulate what the websocket does
    const rows = await ds.executeSql(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema='public'
        AND table_type='BASE TABLE';
    `, { database: 'template1' });
    
    console.log("TABLES returned for template1:", rows.map((r: any) => r.table_name));
    await pool.end();
}
test().catch(console.error);
