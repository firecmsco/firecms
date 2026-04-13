import { CollectionRegistry } from "@rebasepro/common";
import { PgEnum, PgTable } from "drizzle-orm/pg-core";
import { Relations } from "drizzle-orm";
import { CollectionRegistryInterface } from "../interfaces";

/**
 * PostgreSQL-specific collection registry.
 * Extends the base CollectionRegistry with support for Drizzle ORM tables, enums, and relations.
 * 
 * Satisfies CollectionRegistryInterface through inheritance from CollectionRegistry.
 */
export class PostgresCollectionRegistry extends CollectionRegistry implements CollectionRegistryInterface {

    private tables = new Map<string, PgTable>();
    private enums = new Map<string, PgEnum<any>>();
    private relations = new Map<string, Relations>();

    registerTable(table: PgTable, dbPath: string) {
        this.tables.set(dbPath, table);
    }

    getTable(dbPath: string): PgTable | undefined {
        return this.tables.get(dbPath);
    }

    /**
     * Checks if a specific collection has a registered table
     */
    hasTableForCollection(dbPath: string): boolean {
        return this.tables.has(dbPath);
    }

    /**
     * Finds collections assigned to a specific driver that do not have a registered table.
     */
    getCollectionsWithoutTables(driverId: string = "(default)"): any[] {
        const collections = this.getCollections().filter(
            c => c.driver === driverId || (!c.driver && driverId === "(default)")
        );
        return collections.filter(c => !this.tables.has(c.dbPath));
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

    /**
     * Get the merged schema object (tables + relations) for use with Drizzle's
     * relational query API (`db.query`).
     */
    getMergedSchema(): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        for (const [name, table] of this.tables.entries()) {
            result[name] = table;
        }
        for (const [name, relation] of this.relations.entries()) {
            result[name] = relation;
        }
        return result;
    }

    /**
     * Get the available Drizzle relation keys for a given collection path.
     * Maps from the collection's relation property names to the Drizzle relation names
     * defined in the schema.
     */
    getRelationKeysForCollection(collectionPath: string): string[] {
        const collection = this.getCollectionByPath(collectionPath) as import("@rebasepro/types").PostgresCollection<any, any>;
        if (!collection?.relations) return [];
        return collection.relations.map(r => r.relationName || r.localKey || "").filter(Boolean);
    }

}

