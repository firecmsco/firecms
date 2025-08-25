import { EntityCollection } from "@firecms/core";
import { PgTable } from "drizzle-orm/pg-core";

class CollectionRegistry {

    private collectionsByDbPath = new Map<string, EntityCollection>();
    private collectionsBySlug = new Map<string, EntityCollection>();
    private tables = new Map<string, PgTable>();
    private enums = new Map<string, unknown>();
    private relations = new Map<string, unknown>();
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

    registerEnums(enums: Record<string, unknown>) {
        Object.entries(enums).forEach(([name, value]) => this.enums.set(name, value));
    }

    registerRelations(relations: Record<string, unknown>) {
        Object.entries(relations).forEach(([name, value]) => this.relations.set(name, value));
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

    // New: accessors for enums and relations
    getEnum(name: string): unknown | undefined {
        return this.enums.get(name);
    }

    getRelation(name: string): unknown | undefined {
        return this.relations.get(name);
    }

    getAllEnums(): Record<string, unknown> {
        return Object.fromEntries(this.enums.entries());
    }

    getAllRelations(): Record<string, unknown> {
        return Object.fromEntries(this.relations.entries());
    }

    getAll(): EntityCollection[] {
        return this.collectionsArray;
    }
}

export const collectionRegistry = new CollectionRegistry();
