import { EntityCollection } from "@firecms/core";

class CollectionRegistry {
    private collections = new Map<string, EntityCollection>();
    private collectionsArray: EntityCollection[] = [];

    register(collection: EntityCollection) {
        this.collections.set(collection.dbPath, collection);
        this.collectionsArray.push(collection);
    }

    get(path: string): EntityCollection | undefined {
        return this.collections.get(path);
    }

    getAll(): EntityCollection[] {
        return this.collectionsArray;
    }
}

export const collectionRegistry = new CollectionRegistry();
