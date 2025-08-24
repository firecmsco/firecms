import { EntityCollection } from "@firecms/core";
import { PgTable } from "drizzle-orm/pg-core";

class CollectionRegistry {

    private collectionsByDbPath = new Map<string, EntityCollection>();
    private collectionsBySlug = new Map<string, EntityCollection>();
    private tables = new Map<string, PgTable>();
    private collectionsArray: EntityCollection[] = [];

    register(collection: EntityCollection) {
        this.collectionsByDbPath.set(collection.dbPath, collection);
        if (collection.slug) {
            this.collectionsBySlug.set(collection.slug, collection);
        }
        this.collectionsArray.push(collection);
    }

    registerTable(table: PgTable, dbPath: string) {
        this.tables.set(dbPath, table);
    }

    get(path: string): EntityCollection | undefined {
        return this.collectionsByDbPath.get(path);
    }

    getBySlug(slug: string): EntityCollection | undefined {
        return this.collectionsBySlug.get(slug);
    }

    getTable(dbPath: string): PgTable | undefined {
        return this.tables.get(dbPath);
    }

    getAll(): EntityCollection[] {
        return this.collectionsArray;
    }
}

export const collectionRegistry = new CollectionRegistry();
