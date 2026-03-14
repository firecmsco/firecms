import { Pool, Client } from 'pg';

async function verify() {
    const connStr = 'postgresql://postgres:A%3FCl8L%5DpUHiO%3A%5COT@34.22.208.81:5432/rebase';
    console.log("Original:", connStr);

    const cxnUrl = new URL(connStr);
    cxnUrl.pathname = '/postgres';
    console.log("Modified:", cxnUrl.toString());

    try {
        const client = new Client({ connectionString: cxnUrl.toString() });
        await client.connect();
        const res = await client.query(`SELECT current_database();`);
        console.log("Current DB is:", res.rows[0]);

        const tables = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema='public'
            AND table_type='BASE TABLE';
        `);
        console.log("Tables in postgres:", tables.rows.map(r => r.table_name));

        const rebaseTables = await client.query(`
            SELECT * FROM pg_class LIMIT 1;
        `);
        console.log("Success connected");

        await client.end();
    } catch (e) {
        console.error("Error:", e);
    }
}
verify();
