export interface BackendCollection {
    id: string;
    name: string;
    path: string;
    properties: Record<string, any>;
    databaseId?: string;
    idField?: string;
}

class CollectionRegistry {
    private collections = new Map<string, BackendCollection>();
    private collectionsArray: BackendCollection[] = [];

    register(collection: BackendCollection) {
        this.collections.set(collection.path, collection);
        this.collectionsArray.push(collection);
    }

    get(path: string): BackendCollection | undefined {
        return this.collections.get(path);
    }

    getAll(): BackendCollection[] {
        return this.collectionsArray;
    }
}

export const collectionRegistry = new CollectionRegistry();
