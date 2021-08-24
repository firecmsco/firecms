import {
    Entity,
    EntityReference,
    EntitySchema,
    EntityStatus,
    EntityValues
} from "../entities";
import { FilterValues } from "../collections";
import { CMSAppContext } from "../../contexts";
import { Property } from "../properties";

export type SaveEntityProps<M extends { [Key: string]: any }> = {
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

export type DeleteEntityProps<M extends { [Key: string]: any }> = {
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

    fetchCollection<M extends { [Key: string]: any }>(
        path: string,
        schema: EntitySchema<M>,
        filter?: FilterValues<M>,
        limit?: number,
        startAfter?: any[],
        orderBy?: string,
        order?: "desc" | "asc"
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
    listenCollection?<M extends { [Key: string]: any }>(
        path: string,
        schema: EntitySchema<M>,
        onSnapshot: (entity: Entity<M>[]) => void,
        onError?: (error: Error) => void,
        filter?: FilterValues<M>,
        limit?: number,
        startAfter?: any[],
        orderBy?: string,
        order?: "desc" | "asc"
    ): () => void;

    /**
     * Retrieve an entity given a path and a schema
     * @param path
     * @param entityId
     * @param schema
     * @category Firestore
     */
    fetchEntity<M extends { [Key: string]: any }>(
        path: string,
        entityId: string,
        schema: EntitySchema<M>
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
    listenEntity?<M extends { [Key: string]: any }>(
        path: string,
        entityId: string,
        schema: EntitySchema<M>,
        onSnapshot: (entity: Entity<M>) => void,
        onError?: (error: Error) => void,
    ): () => void;

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
    saveEntity<M extends { [Key: string]: any }>(
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
    deleteEntity<M extends { [Key: string]: any }>(
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
