import { Entity, EntitySchema, EntityStatus, EntityValues } from "./entities";
import { FilterValues } from "./collections";
import { Property } from "./properties";

/**
 * @category Datasource
 */
export interface FetchEntityProps<M> {
    path: string,
    entityId: string,
    schema: EntitySchema<M>
}

/**
 * @category Datasource
 */
export type ListenEntityProps<M> = FetchEntityProps<M> & {
    onUpdate: (entity: Entity<M>) => void,
    onError?: (error: Error) => void,
}

/**
 * @category Datasource
 */
export interface FetchCollectionProps<M> {
    path: string,
    schema: EntitySchema<M>,
    filter?: FilterValues<M>,
    limit?: number,
    startAfter?: any[],
    orderBy?: string,
    searchString?: string,
    order?: "desc" | "asc"
}

/**
 * @category Datasource
 */
export type ListenCollectionProps<M> =
    FetchCollectionProps<M> &
    {
        onUpdate: (entities: Entity<M>[]) => void,
        onError?: (error: Error) => void,
    };

/**
 * @category Datasource
 */
export interface SaveEntityProps<M> {
    path: string;
    entityId: string | undefined;
    values: Partial<EntityValues<M>>;
    previousValues?: Partial<EntityValues<M>>;
    schema: EntitySchema<M>;
    status: EntityStatus;
}

/**
 * @category Datasource
 */
export interface DeleteEntityProps<M> {
    entity: Entity<M>;
    schema: EntitySchema<M>;
}

/**
 * Implement this interface and pass it to a {@link FireCMS}
 * to connect it to your data source.
 * A Firestore implementation of this interface can be found in {@link useFirestoreDataSource}
 * @category Datasource
 */
export interface DataSource {

    /**
     * Fetch data from a collection
     * @param path
     * @param schema
     * @param filter
     * @param limit
     * @param startAfter
     * @param orderBy
     * @param order
     * @param searchString
     * @return Function to cancel subscription
     * @see useCollectionFetch if you need this functionality implemented as a hook
     */
    fetchCollection<M>({
                           path,
                           schema,
                           filter,
                           limit,
                           startAfter,
                           orderBy,
                           order,
                           searchString
                       }: FetchCollectionProps<M>
    ): Promise<Entity<M>[]>;

    /**
     * Listen to a entities in a given path. If you don't implement this method
     * `fetchCollection` will be used instead, with no real time updates.
     * @param path
     * @param schema
     * @param onSnapshot
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
    listenCollection?<M>(
        {
            path,
            schema,
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
     * Retrieve an entity given a path and a schema
     * @param path
     * @param entityId
     * @param schema
     */
    fetchEntity<M>({
                       path,
                       entityId,
                       schema
                   }: FetchEntityProps<M>
    ): Promise<Entity<M>>;

    /**
     * Get realtime updates on one entity.
     * @param path
     * @param entityId
     * @param schema
     * @param onSnapshot
     * @param onError
     * @return Function to cancel subscription
     */
    listenEntity?<M>({
                         path,
                         entityId,
                         schema,
                         onUpdate,
                         onError
                     }: ListenEntityProps<M>): () => void;

    /**
     * Save entity to the specified path
     * @param path
     * @param id
     * @param schema
     * @param status
     */
    saveEntity<M>(
        {
            path,
            entityId,
            values,
            schema,
            status
        }: SaveEntityProps<M>): Promise<Entity<M>>;

    /**
     * Delete an entity
     * @param entity
     * @param schema
     * @param path
     * @return was the whole deletion flow successful
     */
    deleteEntity<M>(
        {
            entity,
            schema
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
        property: Property,
        entityId?: string
    ): Promise<boolean>;


}
