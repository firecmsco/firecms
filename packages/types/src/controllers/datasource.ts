import { NavigationController } from "./navigation";
import { Entity, EntityCollection, EntityStatus, EntityValues, FilterValues } from "../types";
import { FireCMSContext } from "../firecms_context";

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

/**
 * Component in charge of communicating with the data source.
 * Usually you won't need to implement this interface, but a {@link DataSourceDelegate} instead.
 * @group Datasource
 */
export interface DataSource {

    /**
     * Fetch data from a collection
     * @param path
     * @param collection
     * @param filter
     * @param limit
     * @param startAfter
     * @param orderBy
     * @param order
     * @param searchString
     * @return Function to cancel subscription
     * @see useCollectionFetch if you need this functionality implemented as a hook
     */
    fetchCollection<M extends Record<string, any> = any>({
        path,
        collection,
        filter,
        limit,
        startAfter,
        orderBy,
        order,
        searchString
    }: FetchCollectionProps<M>
    ): Promise<Entity<M>[]>;

    /**
     * Listen to a collection in a given path. If you don't implement this method
     * `fetchCollection` will be used instead, with no real time updates.
     * @param path
     * @param collection
     * @param onUpdate
     * @param onError
     * @param filter
     * @param limit
     * @param startAfter
     * @param orderBy
     * @param order
     * @param searchString
     * @return Function to cancel subscription
     * @see useCollectionFetch if you need this functionality implemented as a hook
     */
    listenCollection?<M extends Record<string, any> = any>(
        {
            path,
            collection,
            filter,
            limit,
            startAfter,
            searchString,
            orderBy,
            order,
            onUpdate,
            onError
        }: ListenCollectionProps<M>
    ): () => void;

    /**
     * Retrieve an entity given a path and a collection
     * @param path
     * @param entityId
     * @param collection
     */
    fetchEntity<M extends Record<string, any> = any>({
        path,
        entityId,
        databaseId,
        collection
    }: FetchEntityProps<M>
    ): Promise<Entity<M> | undefined>;

    /**
     * Get realtime updates on one entity.
     * @param path
     * @param entityId
     * @param collection
     * @param onUpdate
     * @param onError
     * @return Function to cancel subscription
     */
    listenEntity?<M extends Record<string, any> = any>({
        path,
        entityId,
        collection,
        onUpdate,
        onError
    }: ListenEntityProps<M>): () => void;

    /**
     * Save entity to the specified path
     * @param path
     * @param id
     * @param collection
     * @param status
     */
    saveEntity<M extends Record<string, any> = any>(
        {
            path,
            entityId,
            values,
            collection,
            status
        }: SaveEntityProps<M>): Promise<Entity<M>>;

    /**
     * Delete an entity
     * @param entity
     * @return was the whole deletion flow successful
     */
    deleteEntity<M extends Record<string, any> = any>(
        {
            entity,
            collection
        }: DeleteEntityProps<M>
    ): Promise<void>;

    /**
     * Check if the given property is unique in the given collection
     * @param path Collection path
     * @param name of the property
     * @param value
     * @param collection
     * @param entityId
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
     * Generate an id for a new entity.
     * If not implemented, the is will be generated by the data source delegate (e.g. Firestore, Postgres, etc.)
     */
    generateEntityId(path: string, collection: EntityCollection): string | undefined;

    /**
     * Count the number of entities in a collection
     */
    countEntities?<M extends Record<string, any> = any>(props: FetchCollectionProps<M>): Promise<number>;

    /**
     * Check if the given filter combination is valid
     * @param props
     */
    isFilterCombinationValid?(props: FilterCombinationValidProps): boolean;

    /**
     * Called when the user clicks on the search bar in a collection view.
     * Useful for initializing a text search index.
     * @param props
     */
    initTextSearch: (props: {
        context: FireCMSContext,
        path: string,
        collection: EntityCollection,
        parentCollectionIds?: string[]
    }) => Promise<boolean>;

    /**
     * Flag to indicate if the datasource delegate has requested the initialization of the text search index
     */
    needsInitTextSearch: boolean;

}

export type FilterCombinationValidProps = {
    path: string;
    collection: EntityCollection<any>;
    filterValues: FilterValues<any>;
    sortBy?: [string, "asc" | "desc"];
};

export type SaveEntityDelegateProps<M extends Record<string, any> = any> = SaveEntityProps<M> & {
    navigationController?: NavigationController
};

export type FetchCollectionDelegateProps<M extends Record<string, any> = any> = FetchCollectionProps<M> & {
    navigationController?: NavigationController
};

export type ListenCollectionDelegateProps<M extends Record<string, any> = any> = ListenCollectionProps<M> & {
    navigationController?: NavigationController
};

export type ListenEntityDelegateProps<M extends Record<string, any> = any> = ListenEntityProps<M> & {
    navigationController?: NavigationController
};

export type FetchEntityDelegateProps<M extends Record<string, any> = any> = FetchEntityProps<M> & {
    navigationController?: NavigationController
}

export type DeleteEntityDelegateProps<M extends Record<string, any> = any> = DeleteEntityProps<M> & {
    navigationController?: NavigationController
}

export interface DataSourceDelegate {

    /**
     * Key that identifies this data source delegate
     */
    key: string;

    /**
     * If the data source has been initialised
     */
    initialised?: boolean;

    /**
     * Fetch data from a collection
     * @param path
     * @param filter
     * @param limit
     * @param startAfter
     * @param orderBy
     * @param order
     * @param searchString
     * @return Function to cancel subscription
     * @see useCollectionFetch if you need this functionality implemented as a hook
     */
    fetchCollection<M extends Record<string, any> = any>({
        path,
        filter,
        limit,
        startAfter,
        orderBy,
        order,
        searchString
    }: FetchCollectionDelegateProps<M>): Promise<Entity<M>[]>;

    /**
     * Listen to a collection in a given path. If you don't implement this method
     * `fetchCollection` will be used instead, with no real time updates.
     * @param path
     * @param onUpdate
     * @param onError
     * @param filter
     * @param limit
     * @param startAfter
     * @param orderBy
     * @param order
     * @param searchString
     * @return Function to cancel subscription
     * @see useCollectionFetch if you need this functionality implemented as a hook
     */
    listenCollection?<M extends Record<string, any> = any>({
        path,
        filter,
        limit,
        startAfter,
        searchString,
        orderBy,
        order,
        onUpdate,
        onError
    }: ListenCollectionDelegateProps<M>): () => void;

    /**
     * Retrieve an entity given a path and a collection
     * @param path
     * @param entityId
     */
    fetchEntity<M extends Record<string, any> = any>({
        path,
        entityId,
    }: FetchEntityDelegateProps<M>): Promise<Entity<M> | undefined>;

    /**
     * Get realtime updates on one entity.
     * @param path
     * @param entityId
     * @param collection
     * @param onUpdate
     * @param onError
     * @return Function to cancel subscription
     */
    listenEntity?<M extends Record<string, any> = any>({
        path,
        entityId,
        onUpdate,
        onError
    }: ListenEntityDelegateProps<M>): () => void;

    /**
     * Save entity to the specified path
     * @param path
     * @param entityId
     * @param values
     * @param status
     */
    saveEntity<M extends Record<string, any> = any>({
        path,
        entityId,
        values,
        status
    }: SaveEntityDelegateProps<M>): Promise<Entity<M>>;

    /**
     * Delete an entity
     * @param entity
     * @return was the whole deletion flow successful
     */
    deleteEntity<M extends Record<string, any> = any>({ entity }: DeleteEntityDelegateProps<M>): Promise<void>;

    /**
     * Check if the given property is unique in the given collection
     * @param path Collection path
     * @param name of the property
     * @param value
     * @param entityId
     * @param collection
     * @return `true` if there are no other fields besides the given entity
     */
    checkUniqueField(path: string, name: string, value: any, entityId?: string | number, collection?: EntityCollection): Promise<boolean>;

    /**
     * Generate an id for a new entity
     */
    generateEntityId?(path: string, collection?: EntityCollection): string | undefined;

    /**
     * Count the number of entities in a collection
     */
    countEntities?<M extends Record<string, any> = any>(props: FetchCollectionDelegateProps<M>): Promise<number>;

    /**
     * Check if the given filter combination is valid
     * @param props
     */
    isFilterCombinationValid?(props: Omit<FilterCombinationValidProps, "collection"> & {
        databaseId?: string,
        navigationController?: NavigationController
    }): boolean;

    /**
     * Get the object to generate the current time in the datasource
     */
    currentTime?: () => any;

    setDateToMidnight?: (input?: any) => any;

    delegateToCMSModel?: (data: any) => any;

    cmsToDelegateModel?: (data: any) => any;

    initTextSearch?: (props: {
        context: FireCMSContext,
        path: string,
        databaseId?: string,
        collection: EntityCollection,
        parentCollectionIds?: string[]
    }) => Promise<boolean>;
}
