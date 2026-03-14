import { DataSource, Entity, EntityCollection, EntityValues, RebaseContext, SaveEntityProps } from "@rebasepro/types";
import { useDataSource } from "./useDataSource";

/**
 * @group Hooks and utilities
 */
export type SaveEntityWithCallbacksProps<M extends Record<string, any>> =
    SaveEntityProps<M> &
    {
        afterSave?: (updatedEntity: Entity<M>) => void,
        afterSaveError?: (e: Error) => void
    }

/**
 * This function is in charge of saving an entity to the datasource.
 * It will run all the save callbacks specified in the collection.
 * It is also possible to attach callbacks on save success or error, and callback
 * errors.
 *
 * If you just want to save the data without running the `afterSave`,
 * `afterSaveError` and `beforeSave` callbacks, you can use the `saveEntity` method
 * in the datasource ({@link useDataSource}).
 *
 * @param collection
 * @param path
 * @param entityId
 * @param callbacks
 * @param values
 * @param previousValues
 * @param status
 * @param dataSource
 * @param context
 * @param afterSave
 * @param afterSaveError
 * @see useDataSource
 * @group Hooks and utilities
 */
export async function saveEntityWithCallbacks<M extends Record<string, any>>({
    collection,
    path,
    entityId,
    values,
    previousValues,
    status,
    dataSource,
    context,
    afterSave,
    afterSaveError
}: SaveEntityWithCallbacksProps<M> & {
    collection: EntityCollection,
    dataSource: DataSource,
    context: RebaseContext,
}
): Promise<Entity<M>> {

    if (status !== "new" && !entityId) {
        throw new Error("Entity id must be specified when updating an existing entity");
    }

    return dataSource.saveEntity({
        collection,
        path,
        entityId,
        values,
        previousValues,
        status
    }).then((entity) => {
        if (afterSave)
            afterSave(entity);
        return entity as Entity<M>;
    }).catch((e) => {
        if (afterSaveError) afterSaveError(e);
        throw e;
    });
}
