import {
    DataSource,
    DeleteEntityProps,
    Entity,
    EntityCallbacks,
    EntityOnDeleteProps,
    FireCMSContext,
    ResolvedEntityCollection,
    User
} from "@firecms/types";

/**
 * @group Hooks and utilities
 */
export type DeleteEntityWithCallbacksProps<M extends Record<string, any>, USER extends User = User> =
    DeleteEntityProps<M>
    & {
    callbacks?: EntityCallbacks<M, USER>;
    onDeleteSuccess?: (entity: Entity<M>) => void;
    onDeleteFailure?: (entity: Entity<M>, e: Error) => void;
    onPreDeleteHookError?: (entity: Entity<M>, e: Error) => void;
    onDeleteSuccessHookError?: (entity: Entity<M>, e: Error) => void;
}

/**
 * This function is in charge of deleting an entity in the datasource.
 * It will run all the delete callbacks specified in the collection.
 * It is also possible to attach callbacks on save success or error, and callback
 * errors.
 *
 * If you just want to delete any data without running the `onPreDelete`,
 * and `onDelete` callbacks, you can use the `deleteEntity` method
 * in the datasource ({@link useDataSource}).
 *
 * @param dataSource
 * @param entity
 * @param collection
 * @param callbacks
 * @param onDeleteSuccess
 * @param onDeleteFailure
 * @param onPreDeleteHookError
 * @param onDeleteSuccessHookError
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
                                                                                                          onPreDeleteHookError,
                                                                                                          onDeleteSuccessHookError,
                                                                                                          context
                                                                                                      }: DeleteEntityWithCallbacksProps<M> & {
                                                                                                          collection: ResolvedEntityCollection<M>,
                                                                                                          dataSource: DataSource,
                                                                                                          context: FireCMSContext<USER>
                                                                                                      }
): Promise<boolean> {

    console.debug("Deleting entity", entity.path, entity.id);

    const entityDeleteProps: EntityOnDeleteProps<M, any> = {
        entity,
        collection,
        entityId: entity.id,
        path: entity.path,
        context
    };

    if (callbacks?.onPreDelete) {
        try {
            await callbacks.onPreDelete(entityDeleteProps);
        } catch (e: any) {
            console.error(e);
            if (onPreDeleteHookError)
                onPreDeleteHookError(entity, e);
            return false;
        }
    }
    return dataSource.deleteEntity({
        entity,
        collection
    }).then(() => {
        onDeleteSuccess && onDeleteSuccess(entity);
        try {
            if (callbacks?.onDelete) {
                callbacks.onDelete(entityDeleteProps);
            }
            return true;
        } catch (e: any) {
            if (onDeleteSuccessHookError)
                onDeleteSuccessHookError(entity, e);
            return false;
        }
    }).catch((e) => {
        if (onDeleteFailure) onDeleteFailure(entity, e);
        return false;
    });
}
