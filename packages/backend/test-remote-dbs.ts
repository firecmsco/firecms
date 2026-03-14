import { DatabasePoolManager } from './src/services/databasePoolManager';

async function listDbs() {
    const connStr = 'postgresql://postgres:A%3FCl8L%5DpUHiO%3A%5COT@34.22.208.81:5432/rebase';

    console.log("Initializing DatabasePoolManager...");
    const poolManager = new DatabasePoolManager(connStr);

    const defaultPool = poolManager.getPool(poolManager.defaultDatabaseName);
    const client = await defaultPool.connect();

    try {
        const dbsRes = await client.query(`SELECT datname FROM pg_database WHERE datistemplate = false;`);
        const dbs = dbsRes.rows.map((r: any) => r.datname);
        console.log("Databases:", dbs);

        for (const db of dbs) {
            if (db === 'rebase') continue; // We know rebase has tables
            try {
                console.log(`\nConnecting to database: ${db}`);
                const dbPool = poolManager.getPool(db);
                const dbClient = await dbPool.connect();
                try {
                    const tbls = await dbClient.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';`);
                    console.log(`Tables in ${db}:`, tbls.rows.map((r: any) => r.table_name));
                } finally {
                    dbClient.release();
                }
            } catch (e: any) {
                console.error(`Error checking DB ${db}:`, e.message);
            }
        }
    } finally {
        client.release();
    }

    await poolManager.shutdown();
}

listDbs().catch(console.error);

