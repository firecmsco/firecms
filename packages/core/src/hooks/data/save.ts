import type { EntityCollection } from "@rebasepro/types";
import { DataDriver, Entity, EntityValues, RebaseContext, SaveEntityProps } from "@rebasepro/types";
import { RebaseData } from "@rebasepro/types";

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
 * This function is in charge of saving an entity.
 * It will run all the save callbacks specified in the collection.
 * It is also possible to attach callbacks on save success or error, and callback
 * errors.
 *
 * @param collection
 * @param path
 * @param entityId
 * @param callbacks
 * @param values
 * @param previousValues
 * @param status
 * @param data
 * @param context
 * @param afterSave
 * @param afterSaveError
 * @group Hooks and utilities
 */
export async function saveEntityWithCallbacks<M extends Record<string, any>>({
    collection,
    path,
    entityId,
    values,
    previousValues,
    status,
    data,
    context,
    afterSave,
    afterSaveError
}: SaveEntityWithCallbacksProps<M> & {
    collection: EntityCollection,
    data: RebaseData,
    context: RebaseContext,
}
): Promise<Entity<M>> {

    if (status !== "new" && !entityId) {
        throw new Error("Entity id must be specified when updating an existing entity");
    }

    const accessor = data.collection(path);

    let savePromise: Promise<Entity<M>>;
    if (status === "new") {
        savePromise = accessor.create(values, entityId);
    } else {
        savePromise = accessor.update(entityId!, values);
    }

    return savePromise.then((entity) => {
        if (afterSave)
            afterSave(entity);
        return entity as Entity<M>;
    }).catch((e) => {
        if (afterSaveError) afterSaveError(e);
        throw e;
    });
}
