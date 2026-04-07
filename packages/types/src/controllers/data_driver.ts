import { CollectionRegistryController } from "./collection_registry";
import { Entity, EntityCollection, EntityStatus, EntityValues, FilterValues, TableMetadata } from "../types";
import { RebaseContext } from "../rebase_context";

/**
 * @internal
 */
export interface FetchEntityProps<M extends Record<string, any> = any> {
    path: string;
    entityId: string | number;
    databaseId?: string;
    collection?: EntityCollection<M, any>
}

/**
 * @internal
 */
export type ListenEntityProps<M extends Record<string, any> = any> =
    FetchEntityProps<M>
    & {
        onUpdate: (entity: Entity<M> | null) => void,
        onError?: (error: Error) => void,
    }

/**
 * @internal
 */
export interface FetchCollectionProps<M extends Record<string, any> = any> {
    path: string;
    collection?: EntityCollection<M>;
    filter?: FilterValues<Extract<keyof M, string>>,
    limit?: number;
    startAfter?: unknown;
    orderBy?: string;
    searchString?: string;
    order?: "desc" | "asc";
}

/**
 * @internal
 */
export type ListenCollectionProps<M extends Record<string, any> = any> =
    FetchCollectionProps<M> &
    {
        onUpdate: (entities: Entity<M>[]) => void;
        onError?: (error: Error) => void;
    };

/**
 * @internal
 */
export interface SaveEntityProps<M extends Record<string, any> = any> {
    path: string;
    values: Partial<EntityValues<M>>;
    entityId?: string | number; // can be empty for new entities
    previousValues?: Partial<EntityValues<M>>;
    collection?: EntityCollection<M>;
    status: EntityStatus;
}

/**
 * @internal
 */
export interface DeleteEntityProps<M extends Record<string, any> = any> {
    entity: Entity<M>;
    collection?: EntityCollection<M>;
}

export type FilterCombinationValidProps = {
    path: string;
    databaseId?: string;
    collection: EntityCollection<any>;
    filterValues: FilterValues<any>;
    sortBy?: [string, "asc" | "desc"];
};

/**
 * Internal driver interface for communicating with the data layer.
 * This is NOT the public API — use `RebaseData` / `context.data` instead.
 * @internal
 */
export interface DataDriver {

    /**
     * Key that identifies this driver
     */
    key?: string;

    /**
     * If the driver has been initialised
     */
    initialised?: boolean;

    /**
     * Fetch data from a collection
     * @param props
     * @return Promise of entities
     */
    fetchCollection<M extends Record<string, any> = any>(props: FetchCollectionProps<M>): Promise<Entity<M>[]>;

    /**
     * Listen to a collection in a given path. If you don't implement this method
     * `fetchCollection` will be used instead, with no real time updates.
     * @param props
     * @return Function to cancel subscription
     */
    listenCollection?<M extends Record<string, any> = any>(props: ListenCollectionProps<M>): () => void;

    /**
     * Retrieve an entity given a path and a collection
     * @param props
     */
    fetchEntity<M extends Record<string, any> = any>(props: FetchEntityProps<M>): Promise<Entity<M> | undefined>;

    /**
     * Get realtime updates on one entity.
     * @param props
     * @return Function to cancel subscription
     */
    listenEntity?<M extends Record<string, any> = any>(props: ListenEntityProps<M>): () => void;

    /**
     * Save entity to the specified path
     * @param props
     */
    saveEntity<M extends Record<string, any> = any>(props: SaveEntityProps<M>): Promise<Entity<M>>;

    /**
     * Delete an entity
     * @param props
     * @return was the whole deletion flow successful
     */
    deleteEntity<M extends Record<string, any> = any>(props: DeleteEntityProps<M>): Promise<void>;

    /**
     * Check if the given property is unique in the given collection
     * @param path Collection path
     * @param name of the property
     * @param value
     * @param entityId
     * @param collection
     * @return `true` if there are no other fields besides the given entity
     */
    checkUniqueField(
        path: string,
        name: string,
        value: unknown,
        entityId?: string | number,
        collection?: EntityCollection
    ): Promise<boolean>;

    /**
     * Count the number of entities in a collection
     */
    countEntities?<M extends Record<string, any> = any>(props: FetchCollectionProps<M>): Promise<number>;

    /**
     * Check if the given filter combination is valid
     * @param props
     */
    isFilterCombinationValid?(props: Omit<FilterCombinationValidProps, "collection"> & {
        databaseId?: string
    }): boolean;

    /**
     * Get the object to generate the current time in the driver
     */
    currentTime?: () => unknown;

    delegateToCMSModel?: (data: unknown) => unknown;

    cmsToDelegateModel?: (data: unknown) => unknown;

    initTextSearch?: (props: {
        context: RebaseContext,
        path: string,
        databaseId?: string,
        collection: EntityCollection,
        parentCollectionIds?: string[]
    }) => Promise<boolean>;

    /**
     * Execute raw SQL (if supported by the driver)
     */
    executeSql?(sql: string, options?: { database?: string, role?: string }): Promise<Record<string, unknown>[]>;

    /**
     * Fetch the available databases (if supported by the driver)
     */
    fetchAvailableDatabases?(): Promise<string[]>;

    /**
     * Fetch the available roles (if supported by the driver)
     */
    fetchAvailableRoles?(): Promise<string[]>;

    /**
     * Fetch the current database name (if supported by the driver)
     */
    fetchCurrentDatabase?(): Promise<string | undefined>;

    /**
     * Fetch database tables not yet mapped to a collection (if supported)
     */
    fetchUnmappedTables?(mappedPaths?: string[]): Promise<string[]>;

    /**
     * Fetch metadata for a given table (if supported)
     */
    fetchTableMetadata?(tableName: string): Promise<TableMetadata>;

    /**
     * Flag to indicate if the driver has requested the initialization of the text search index
     */
    needsInitTextSearch?: boolean;

}
