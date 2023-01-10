import {
    DataSource,
    Entity,
    EntityCallbacks,
    EntityValues,
    FireCMSContext,
    SaveEntityProps,
    User
} from "../../types";
import { useDataSource } from "./useDataSource";
import { resolveCollection } from "../../core";

/**
 * @category Hooks and utilities
 */
export type SaveEntityWithCallbacksProps<M extends Record<string, any>> =
    SaveEntityProps<M> &
    {
        callbacks?: EntityCallbacks<M>;
        onSaveSuccess?: (updatedEntity: Entity<M>) => void,
        onSaveFailure?: (e: Error) => void,
        onPreSaveHookError?: (e: Error) => void,
        onSaveSuccessHookError?: (e: Error) => void
    }

/**
 * This function is in charge of saving an entity to the datasource.
 * It will run all the save callbacks specified in the collection.
 * It is also possible to attach callbacks on save success or error, and callback
 * errors.
 *
 * If you just want to save the data without running the `onSaveSuccess`,
 * `onSaveFailure` and `onPreSave` callbacks, you can use the `saveEntity` method
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
 * @param onSaveSuccess
 * @param onSaveFailure
 * @param onPreSaveHookError
 * @param onSaveSuccessHookError
 * @see useDataSource
 * @category Hooks and utilities
 */
export async function saveEntityWithCallbacks<M extends Record<string, any>, UserType extends User>({
                                                               collection,
                                                               path,
                                                               entityId,
                                                               values,
                                                               previousValues,
                                                               status,
                                                               dataSource,
                                                               context,
                                                               onSaveSuccess,
                                                               onSaveFailure,
                                                               onPreSaveHookError,
                                                               onSaveSuccessHookError
                                                           }: SaveEntityWithCallbacksProps<M> & {
                                                               dataSource: DataSource,
                                                               context: FireCMSContext<UserType>,
                                                           }
): Promise<void> {

    let updatedValues: Partial<EntityValues<M>>;

    const resolvedPath = context.navigation.resolveAliasesFrom(path);

    const callbacks = collection.callbacks;
    if (callbacks?.onPreSave) {
        try {
            const resolvedCollection = resolveCollection<M>({
                collection,
                path,
                values: previousValues as EntityValues<M>,
                entityId,
                fields: context.fields
            });
            updatedValues = await callbacks.onPreSave({
                collection: resolvedCollection,
                path,
                resolvedPath,
                entityId,
                values,
                previousValues,
                status,
                context
            });
        } catch (e: any) {
            console.error(e);
            if (onPreSaveHookError)
                onPreSaveHookError(e);
            return;
        }
    } else {
        updatedValues = values;
    }

    return dataSource.saveEntity({
        collection,
        path: resolvedPath,
        entityId,
        values: updatedValues,
        previousValues,
        status
    }).then((entity) => {
        try {
            if (callbacks?.onSaveSuccess) {
                const resolvedCollection = resolveCollection<M>({
                    collection,
                    path,
                    values: updatedValues as EntityValues<M>,
                    entityId,
                    fields: context.fields
                });
                callbacks.onSaveSuccess({
                    collection: resolvedCollection,
                    path,
                    resolvedPath,
                    entityId: entity.id,
                    values: updatedValues,
                    previousValues,
                    status,
                    context
                });
            }
        } catch (e: any) {
            if (onSaveSuccessHookError)
                onSaveSuccessHookError(e);
        }
        if (onSaveSuccess)
            onSaveSuccess(entity);
    })
        .catch((e) => {
            if (callbacks?.onSaveFailure) {

                const resolvedCollection = resolveCollection<M>({
                    collection,
                    path,
                    values: updatedValues as EntityValues<M>,
                    entityId,
                    fields: context.fields
                });
                callbacks.onSaveFailure({
                    collection: resolvedCollection,
                    path,
                    resolvedPath,
                    entityId,
                    values: updatedValues,
                    previousValues,
                    status,
                    context
                });
            }
            if (onSaveFailure) onSaveFailure(e);
        });
}
