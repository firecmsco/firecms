import { EntityCollection } from "@firecms/types";
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

    getAllCollectionsRecursively(): EntityCollection[] {
        const result: EntityCollection[] = [];

        function addCollection(collection: EntityCollection) {
            result.push(collection);
            const subcollections = collection.subcollections?.();
            if (subcollections) {
                subcollections.forEach(addCollection);
            }
        }

        this.collectionsArray.forEach(addCollection);
        return result;
    }

    /**
     * Resolves a multi-segment path like "products/123/locales" and returns
     * information about the collections and entity IDs along the path
     */
    resolvePathToCollections(path: string): {
        collections: EntityCollection[],
        entityIds: (string | number)[],
        finalCollection: EntityCollection
    } {
        const pathSegments = path.split("/").filter(p => p);

        if (pathSegments.length === 0) {
            throw new Error(`Invalid path: ${path}`);
        }

        if (pathSegments.length % 2 !== 1) {
            throw new Error(`Invalid collection path: ${path}. It must have an odd number of segments.`);
        }

        const collections: EntityCollection[] = [];
        const entityIds: (string | number)[] = [];

        // Start with the first collection
        let currentCollection: EntityCollection | undefined = this.getBySlug(pathSegments[0]) ?? this.get(pathSegments[0]);

        if (!currentCollection) {
            throw new Error(`Unknown collection path or slug: ${pathSegments[0]}`);
        }

        collections.push(currentCollection);

        // Process the rest of the path in pairs (entityId, subcollectionSlug)
        for (let i = 1; i < pathSegments.length; i += 2) {
            const entityId = pathSegments[i];
            entityIds.push(entityId);

            if (i + 1 < pathSegments.length) {
                const subcollectionSlug = pathSegments[i + 1];
                const subcollections = currentCollection?.subcollections?.();
                if (!subcollections) {
                    throw new Error(`No subcollections found for ${currentCollection.slug || currentCollection.dbPath} in path: ${path}`);
                }

                const subcollection = subcollections.find(c => c.slug === subcollectionSlug);
                if (!subcollection) {
                    throw new Error(`Subcollection '${subcollectionSlug}' not found in ${currentCollection.slug || currentCollection.dbPath}`);
                }
                currentCollection = subcollection;
                collections.push(currentCollection);
            }
        }

        return {
            collections,
            entityIds,
            finalCollection: currentCollection
        };
    }

    /**
     * Get all collections that are resolved from a multi-segment path
     */
    getAllResolvedCollections(path: string): EntityCollection[] {
        try {
            const { collections } = this.resolvePathToCollections(path);
            return collections;
        } catch (error) {
            // If path resolution fails, try to resolve as a simple path
            const collection = this.getBySlug(path) ?? this.get(path);
            return collection ? [collection] : [];
        }
    }
}

export const collectionRegistry = new CollectionRegistry();
