import {
    DataSource,
    DeleteEntityProps,
    Entity,
    EntityCallbacks,
    EntityCollection,
    EntityBeforeDeleteProps,
    RebaseContext,
    User
} from "@rebasepro/types";

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
 * This function is in charge of deleting an entity in the datasource.
 * It will run all the delete callbacks specified in the collection.
 * It is also possible to attach callbacks on save success or error, and callback
 * errors.
 *
 * If you just want to delete any data without running the `beforeDelete`,
 * and `afterDelete` callbacks, you can use the `deleteEntity` method
 * in the datasource ({@link useDataSource}).
 *
 * @param dataSource
 * @param entity
 * @param collection
 * @param callbacks
 * @param onDeleteSuccess
 * @param onDeleteFailure
 * @param context
 * @group Hooks and utilities
 */
export async function deleteEntityWithCallbacks<M extends Record<string, any>, USER extends User>({
    dataSource,
    entity,
    collection,
    callbacks,
    onDeleteSuccess,
    onDeleteFailure,
    context
}: DeleteEntityWithCallbacksProps<M> & {
    collection: EntityCollection<M>,
    dataSource: DataSource,
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

    return dataSource.deleteEntity({
        entity,
        collection
    }).then(() => {
        onDeleteSuccess && onDeleteSuccess(entity);
        return true;
    }).catch((e) => {
        if (onDeleteFailure) onDeleteFailure(entity, e);
        return false;
    });
}
