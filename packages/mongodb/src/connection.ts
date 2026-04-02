/**
 * MongoDB Connection
 *
 * Wraps MongoDB connection to implement the DatabaseConnection interface.
 */

import { Db, MongoClient } from "mongodb";
import { DatabaseConnection } from "@rebasepro/types";

/**
 * MongoDB database connection wrapper that implements DatabaseConnection interface.
 */
export class MongoDBConnection implements DatabaseConnection {
    readonly type = "mongodb";

    constructor(
        public readonly db: Db,
        public readonly client: MongoClient
    ) { }

    get isConnected(): boolean {
        // MongoClient doesn't have a direct isConnected property in v6+
        // We check if the client topology is connected
        try {
            const clientInternal = this.client as unknown as Record<string, { isConnected?: () => boolean } | undefined>;
            return clientInternal.topology?.isConnected?.() ?? false;
        } catch {
            return false;
        }
    }

    async close(): Promise<void> {
        await this.client.close();
    }
}

/**
 * Create a MongoDB database connection from a connection string.
 *
 * @param connectionString - MongoDB connection string (e.g., mongodb://localhost:27017)
 * @param databaseName - Name of the database to use
 * @returns Promise resolving to MongoDBConnection
 *
 * @example
 * ```typescript
 * const connection = await createMongoDBConnection(
 *     "mongodb://localhost:27017",
 *     "my_database"
 * );
 * ```
 */
export async function createMongoDBConnection(
    connectionString: string,
    databaseName: string
): Promise<MongoDBConnection> {
    const client = new MongoClient(connectionString);
    await client.connect();
    const db = client.db(databaseName);
    return new MongoDBConnection(db, client);
}
