import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';

export class DatabasePoolManager {
    private pools: Map<string, Pool> = new Map();
    private drizzleInstances: Map<string, NodePgDatabase> = new Map();
    public readonly defaultDatabaseName: string;
    private readonly rootConnectionString: string;

    constructor(adminConnectionString: string) {
        this.rootConnectionString = adminConnectionString;
        try {
            const url = new URL(adminConnectionString);
            this.defaultDatabaseName = url.pathname.slice(1);
        } catch (e) {
            throw new Error(`Invalid adminConnectionString provided: ${e}`);
        }
    }

    public getDrizzle(databaseName: string): NodePgDatabase<any> {
        const existing = this.drizzleInstances.get(databaseName);
        if (existing) {
            return existing;
        }

        const pool = this.getPool(databaseName);
        const db = drizzle(pool);
        this.drizzleInstances.set(databaseName, db);
        return db;
    }

    public getPool(databaseName: string): Pool {
        if (this.pools.has(databaseName)) {
            return this.pools.get(databaseName)!;
        }

        const url = new URL(this.rootConnectionString);
        url.pathname = `/${databaseName}`;

        const pool = new Pool({
            connectionString: url.toString(),
            max: 10, // Default sensible limit, can be tuned later
            idleTimeoutMillis: 30000,
        });

        // Prevent idle client errors from crashing the Node.js process
        pool.on('error', (err) => {
            console.error(`[DatabasePoolManager] Unexpected error on idle client for db ${databaseName}`, err);
        });

        this.pools.set(databaseName, pool);
        return pool;
    }

    public async shutdown(): Promise<void> {
        const promises = [];
        for (const [dbName, pool] of this.pools.entries()) {
            console.log(`[DatabasePoolManager] Shutting down pool for ${dbName}`);
            promises.push(pool.end());
        }
        await Promise.all(promises);
        this.pools.clear();
    }
}
