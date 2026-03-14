import { CollectionRegistryController } from "./navigation";
import { Entity, EntityCollection, EntityStatus, EntityValues, FilterValues } from "../types";
import { RebaseContext } from "../rebase_context";

/**
 * @group Datasource
 */
export interface FetchEntityProps<M extends Record<string, any> = any> {
    path: string;
    entityId: string | number;
    databaseId?: string;
    collection?: EntityCollection<M, any>
}

/**
 * @group Datasource
 */
export type ListenEntityProps<M extends Record<string, any> = any> =
    FetchEntityProps<M>
    & {
        onUpdate: (entity: Entity<M> | null) => void,
        onError?: (error: Error) => void,
    }

/**
 * @group Datasource
 */
export interface FetchCollectionProps<M extends Record<string, any> = any> {
    path: string;
    collection?: EntityCollection<M>;
    filter?: FilterValues<Extract<keyof M, string>>,
    limit?: number;
    startAfter?: any;
    orderBy?: string;
    searchString?: string;
    order?: "desc" | "asc";
}

/**
 * @group Datasource
 */
export type ListenCollectionProps<M extends Record<string, any> = any> =
    FetchCollectionProps<M> &
    {
        onUpdate: (entities: Entity<M>[]) => void;
        onError?: (error: Error) => void;
    };

/**
 * @group Datasource
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
 * @group Datasource
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
 * Component in charge of communicating with the data source.
 * @group Datasource
 */
export interface DataSource {

    /**
     * Key that identifies this data source
     */
    key?: string;

    /**
     * If the data source has been initialised
     */
    initialised?: boolean;

    /**
     * Fetch data from a collection
     * @param props
     * @return Promise of entities
     * @see useCollectionFetch if you need this functionality implemented as a hook
     */
    fetchCollection<M extends Record<string, any> = any>(props: FetchCollectionProps<M>): Promise<Entity<M>[]>;

    /**
     * Listen to a collection in a given path. If you don't implement this method
     * `fetchCollection` will be used instead, with no real time updates.
     * @param props
     * @return Function to cancel subscription
     * @see useCollectionFetch if you need this functionality implemented as a hook
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
        value: any,
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
     * Get the object to generate the current time in the datasource
     */
    currentTime?: () => any;

    setDateToMidnight?: (input?: any) => any;

    delegateToCMSModel?: (data: any) => any;

    cmsToDelegateModel?: (data: any) => any;

    initTextSearch?: (props: {
        context: RebaseContext,
        path: string,
        databaseId?: string,
        collection: EntityCollection,
        parentCollectionIds?: string[]
    }) => Promise<boolean>;

    /**
     * Execute raw SQL (if supported by the datasource)
     */
    executeSql?(sql: string, options?: { database?: string, role?: string }): Promise<any[]>;

    /**
     * Fetch the available databases (if supported by the datasource)
     */
    fetchAvailableDatabases?(): Promise<string[]>;

    /**
     * Fetch the available roles (if supported by the datasource)
     */
    fetchAvailableRoles?(): Promise<string[]>;

    /**
     * Fetch the current database name (if supported by the datasource)
     */
    fetchCurrentDatabase?(): Promise<string | undefined>;

    /**
     * Flag to indicate if the datasource delegate has requested the initialization of the text search index
     */
    needsInitTextSearch?: boolean;

}
