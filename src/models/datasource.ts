import { Entity, EntitySchema, EntityStatus, EntityValues } from "./entities";
import { FilterValues } from "./collections";
import { CMSAppContext } from "../contexts";
import { Property } from "./properties";

export type FetchEntityProps<M> = {
    path: string,
    entityId: string,
    schema: EntitySchema<M>
};

export type ListenEntityProps<M> = FetchEntityProps<M> & {
    onUpdate: (entity: Entity<M>) => void,
    onError?: (error: Error) => void,
};

export type FetchCollectionProps<M> = {
    path: string,
    schema: EntitySchema<M>,
    filter?: FilterValues<M>,
    limit?: number,
    startAfter?: any[],
    orderBy?: string,
    order?: "desc" | "asc"
};

export type ListenCollectionProps<M> =
    FetchCollectionProps<M> &
    {
        onUpdate: (entities: Entity<M>[]) => void,
        onError?: (error: Error) => void,
    };

export type SaveEntityProps<M> = {
    collectionPath: string,
    id: string | undefined,
    values: Partial<EntityValues<M>>,
    schema: EntitySchema<M>,
    status: EntityStatus,
    onSaveSuccess?: (entity: Entity<M>) => void,
    onSaveFailure?: (e: Error) => void,
    onPreSaveHookError?: (e: Error) => void,
    onSaveSuccessHookError?: (e: Error) => void;
    context: CMSAppContext;
};

export type DeleteEntityProps<M> = {
    entity: Entity<M>;
    schema: EntitySchema<M>;
    onDeleteSuccess?: (entity: Entity<M>) => void;
    onDeleteFailure?: (entity: Entity<M>, e: Error) => void;
    onPreDeleteHookError?: (entity: Entity<M>, e: Error) => void;
    onDeleteSuccessHookError?: (entity: Entity<M>, e: Error) => void;
    context: CMSAppContext;
};

/**
 * Implement this interface and pass it to {@link CMSApp} or {@link CMSAppProvider}
 * if you would like to override the default Firestore data source.
 *
 */
export interface DataSource {

    fetchCollection<M>({
                           path,
                           schema,
                           filter,
                           limit,
                           startAfter,
                           orderBy,
                           order
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
     * @return Function to cancel subscription
     * @see useCollectionFetch if you need this functionality implemented as a hook
     * @category Firestore
     */
    listenCollection?<M>(
        {
            path,
            schema,
            filter,
            limit,
            startAfter,
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
     * @category Firestore
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
     * @category Firestore
     */
    listenEntity?<M>({
                         path,
                         entityId,
                         schema,
                         onUpdate,
                         onError
                     }: ListenEntityProps<M>): () => void;

    /**
     * Save entity to the specified path. Note that Firestore does not allow
     * undefined values.
     * @param collectionPath
     * @param id
     * @param data
     * @param schema
     * @param status
     * @param onSaveSuccess
     * @param onSaveFailure
     * @param onPreSaveHookError
     * @param onSaveSuccessHookError
     * @category Firestore
     */
    saveEntity<M>(
        {
            collectionPath,
            id,
            values,
            schema,
            status,
            onSaveSuccess,
            onSaveFailure,
            onPreSaveHookError,
            onSaveSuccessHookError,
            context
        }: SaveEntityProps<M>): Promise<void>;

    /**
     * Delete an entity
     * @param entity
     * @param schema
     * @param collectionPath
     * @param onDeleteSuccess
     * @param onDeleteFailure
     * @param onPreDeleteHookError
     * @param onDeleteSuccessHookError
     * @param context
     * @return was the whole deletion flow successful
     * @category Firestore
     */
    deleteEntity<M>(
        {
            entity,
            schema,
            onDeleteSuccess,
            onDeleteFailure,
            onPreDeleteHookError,
            onDeleteSuccessHookError,
            context
        }: DeleteEntityProps<M>
    ): Promise<boolean>;

    /**
     * Check if the given property is unique in the given collection
     * @param path Collection path
     * @param name of the property
     * @param value
     * @param property
     * @param entityId
     * @return `true` if there are no other fields besides the given entity
     * @category Firestore
     */
    checkUniqueField(
        path: string,
        name: string,
        value: any,
        property: Property,
        entityId?: string
    ): Promise<boolean>;


}
