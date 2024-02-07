import { Entity, EntityReference, EntityStatus, EntityValues, GeoPoint } from "./entities";
import { EntityCollection, FilterValues } from "./collections";
import { ResolvedEntityCollection } from "./resolved_entities";

/**
 * @group Datasource
 */
export interface FetchEntityProps<M extends Record<string, any> = any> {
    path: string;
    entityId: string;
    collection?: EntityCollection<M>
}

/**
 * @group Datasource
 */
export type ListenEntityProps<M extends Record<string, any> = any> =
    FetchEntityProps<M>
    & {
    onUpdate: (entity: Entity<M>) => void,
    onError?: (error: Error) => void,
}

/**
 * @group Datasource
 */
export interface FetchCollectionProps<M extends Record<string, any> = any> {
    path: string;
    collection?: EntityCollection<M> | ResolvedEntityCollection<M>;
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
    entityId?: string; // can be empty for new entities
    previousValues?: Partial<EntityValues<M>>;
    collection?: EntityCollection<M> | ResolvedEntityCollection<M>;
    status: EntityStatus;
}

/**
 * @group Datasource
 */
export interface DeleteEntityProps<M extends Record<string, any> = any> {
    entity: Entity<M>;
}

/**
 * Implement this interface and pass it to a {@link FireCMS}
 * to connect it to your data source.
 * A Firestore implementation of this interface can be found in {@link useFirestoreDataSource}
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
            entity
        }: DeleteEntityProps<M>
    ): Promise<void>;

    /**
     * Check if the given property is unique in the given collection
     * @param path Collection path
     * @param name of the property
     * @param value
     * @param property
     * @param entityId
     * @return `true` if there are no other fields besides the given entity
     */
    checkUniqueField(
        path: string,
        name: string,
        value: any,
        entityId?: string
    ): Promise<boolean>;

    /**
     * Generate an id for a new entity
     */
    generateEntityId(path: string): string;

    /**
     * Count the number of entities in a collection
     */
    countEntities?<M extends Record<string, any> = any>(props: FetchCollectionProps<M>): Promise<number>;

    /**
     * Check if the given filter combination is valid
     * @param props
     */
    isFilterCombinationValid?(props: FilterCombinationValidProps): boolean;
}

export type FilterCombinationValidProps = {
    path: string;
    collection: EntityCollection<any>;
    filterValues: FilterValues<any>;
    sortBy?: [string, "asc" | "desc"];
};

export type SaveEntityDelegateProps<M extends Record<string, any> = any> = Omit<SaveEntityProps<M>, "collection">;

export type FetchCollectionDelegateProps<M extends Record<string, any> = any> =
    Omit<FetchCollectionProps<M>, "collection">
    & {
    isCollectionGroup?: boolean
};

export type ListenCollectionDelegateProps<M extends Record<string, any> = any> =
    ListenCollectionProps<M>
    & {
    isCollectionGroup?: boolean;
};

export interface DataSourceDelegate {
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
                                                     }: Omit<FetchEntityProps<M>, "collection">): Promise<Entity<M> | undefined>;

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
                                                       }: Omit<ListenEntityProps<M>, "collection">): () => void;

    /**
     * Save entity to the specified path
     * @param path
     * @param id
     * @param collection
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
    deleteEntity<M extends Record<string, any> = any>({ entity }: DeleteEntityProps<M>): Promise<void>;

    /**
     * Check if the given property is unique in the given collection
     * @param path Collection path
     * @param name of the property
     * @param value
     * @param entityId
     * @return `true` if there are no other fields besides the given entity
     */
    checkUniqueField(path: string, name: string, value: any, entityId?: string): Promise<boolean>;

    /**
     * Generate an id for a new entity
     */
    generateEntityId(path: string): string;

    /**
     * Count the number of entities in a collection
     */
    countEntities?<M extends Record<string, any> = any>(props: FetchCollectionDelegateProps<M>): Promise<number>;

    /**
     * Check if the given filter combination is valid
     * @param props
     */
    isFilterCombinationValid?(props: Omit<FilterCombinationValidProps, "collection">): boolean;

    /**
     * Convert a FireCMS reference to a reference that can be used by the datasource
     * @param reference
     */
    buildReference: (reference: EntityReference) => any,

    /**
     * Convert a FireCMS GeoPoint to a GeoPoint that can be used by the datasource
     * @param geoPoint
     */
    buildGeoPoint: (geoPoint: GeoPoint) => any,

    /**
     * Get the object to generate the current time in the datasource
     */
    currentTime(): any;

    buildDate: (date: Date) => any;

    buildDeleteFieldValue: () => any;

    delegateToCMSModel: (data: any) => any;

    setDateToMidnight: (input?: any) => any;
}
