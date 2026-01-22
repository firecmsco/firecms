import { CollectionRegistry } from "@firecms/common";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import { Relations } from "drizzle-orm";
import { CollectionRegistryInterface } from "../db/interfaces";

/**
 * PostgreSQL-specific collection registry.
 * Extends the base CollectionRegistry with support for Drizzle ORM tables, enums, and relations.
 * 
 * Satisfies CollectionRegistryInterface through inheritance from CollectionRegistry.
 */
export class BackendCollectionRegistry extends CollectionRegistry implements CollectionRegistryInterface {

    private tables = new Map<string, PgTable>();
    private enums = new Map<string, PgEnum<any>>();
    private relations = new Map<string, Relations>();

    registerTable(table: PgTable, dbPath: string) {
        this.tables.set(dbPath, table);
    }

    getTable(dbPath: string): PgTable | undefined {
        return this.tables.get(dbPath);
    }

    registerEnums(enums: Record<string, PgEnum<any>>) {
        Object.entries(enums).forEach(([name, value]) => this.enums.set(name, value));
    }

    registerRelations(relations: Record<string, Relations>) {
        Object.entries(relations).forEach(([name, value]) => this.relations.set(name, value));
    }

    getEnum(name: string): PgEnum<any> | undefined {
        return this.enums.get(name);
    }

    getRelation(name: string): Relations | undefined {
        return this.relations.get(name);
    }

    getAllEnums(): Record<string, PgEnum<any>> {
        return Object.fromEntries(this.enums.entries());
    }

    getAllRelations(): Record<string, Relations> {
        return Object.fromEntries(this.relations.entries());
    }

}

/**
 * Alias for BackendCollectionRegistry for consistent naming with other database implementations.
 * This allows code to use PostgresCollectionRegistry alongside future MongoCollectionRegistry, etc.
 */
export const PostgresCollectionRegistry = BackendCollectionRegistry;
