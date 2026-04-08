import type { EntityCollection } from "@rebasepro/types";
import { DeleteEntityProps, Entity, EntityCallbacks, EntityBeforeDeleteProps, RebaseContext, User } from "@rebasepro/types";
import { RebaseData } from "@rebasepro/types";

/**
 * @group Hooks and utilities
 */
export type DeleteEntityWithCallbacksProps<M extends Record<string, any>, USER extends User = User> =
    DeleteEntityProps<M>
    & {
        callbacks?: EntityCallbacks<M, USER>;
        onDeleteSuccess?: (entity: Entity<M>) => void;
        onDeleteFailure?: (entity: Entity<M>, e: Error) => void;
    }

/**
 * This function is in charge of deleting an entity.
 * It will run all the delete callbacks specified in the collection.
 * It is also possible to attach callbacks on save success or error, and callback
 * errors.
 *
 * @param data
 * @param entity
 * @param collection
 * @param callbacks
 * @param onDeleteSuccess
 * @param onDeleteFailure
 * @param context
 * @group Hooks and utilities
 */
export async function deleteEntityWithCallbacks<M extends Record<string, any>, USER extends User>({
    data,
    entity,
    collection,
    callbacks,
    onDeleteSuccess,
    onDeleteFailure,
    context
}: DeleteEntityWithCallbacksProps<M> & {
    collection: EntityCollection<M>,
    data: RebaseData,
    context: RebaseContext<USER>
}
): Promise<boolean> {

    console.debug("Deleting entity", entity.path, entity.id);

    const entityDeleteProps: EntityBeforeDeleteProps<M, any> = {
        entity,
        collection,
        entityId: entity.id,
        path: entity.path,
        context
    };

    return data.collection(entity.path).delete(entity.id).then(() => {
        onDeleteSuccess && onDeleteSuccess(entity);
        return true;
    }).catch((e) => {
        if (onDeleteFailure) onDeleteFailure(entity, e);
        return false;
    });
}
