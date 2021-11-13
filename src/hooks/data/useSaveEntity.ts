import { useEffect } from "react";

import {
    DataSource,
    Entity,
    EntityCallbacks,
    EntityValues,
    FireCMSContext,
    SaveEntityProps
} from "../../models";
import { useDataSource } from "./useDataSource";
import { useFireCMSContext } from "../useFireCMSContext";

/**
 * @category Hooks and utilities
 */
export type SaveEntityWithCallbacksProps<M> =
    SaveEntityProps<M> &
    {
        callbacks?: EntityCallbacks<M>;
        onSaveSuccess?: (updatedEntity: Entity<M>) => void,
        onSaveFailure?: (e: Error) => void,
        onPreSaveHookError?: (e: Error) => void,
        onSaveSuccessHookError?: (e: Error) => void
    }

/**
 * Use this hook if you want to save your entity every time `path`, `entityId` or
 * `values` change
 * @param schema
 * @param path
 * @param entityId
 * @param callbacks
 * @param values
 * @param status
 * @param onSaveSuccess
 * @param onSaveFailure
 * @param onPreSaveHookError
 * @param onSaveSuccessHookError
 * @category Hooks and utilities
 */
export function useSaveEntity<M extends { [Key: string]: any }>({
                                                                    schema,
                                                                    path,
                                                                    entityId,
                                                                    callbacks,
                                                                    values,
                                                                    previousValues,
                                                                    status,
                                                                    onSaveSuccess,
                                                                    onSaveFailure,
                                                                    onPreSaveHookError,
                                                                    onSaveSuccessHookError
                                                                }: SaveEntityWithCallbacksProps<M>) {

    const dataSource = useDataSource();
    const context = useFireCMSContext();
    useEffect(() => {
        saveEntityWithCallbacks(
            {
                dataSource,
                context,
                schema,
                callbacks,
                path,
                entityId,
                values,
                previousValues,
                status,
                onSaveSuccess,
                onSaveFailure,
                onPreSaveHookError,
                onSaveSuccessHookError
            });
    }, [path, entityId, values]);

}

/**
 * This function is in charge of saving an entity to the datasource.
 * It will run all the save callbacks specified in the schema.
 * It is also possible to attach callbacks on save success or error, and callback
 * errors.
 *
 * If you just want to save the data without running the `onSaveSuccess`,
 * `onSaveFailure` and `onPreSave` callbacks, you can use the `saveEntity` method
 * in the datasource ({@link useDataSource}).
 *
 * @param schema
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
 * @see useSaveEntity
 * @category Hooks and utilities
 */
export async function saveEntityWithCallbacks<M, UserType>({
                                                     schema,
                                                     path,
                                                     entityId,
                                                     callbacks,
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
                                                     context: FireCMSContext<UserType> ,
                                                 }
): Promise<void> {

    let updatedValues: Partial<EntityValues<M>>;

    if (callbacks?.onPreSave) {
        try {
            updatedValues = await callbacks.onPreSave({
                schema,
                path,
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
        schema,
        path,
        entityId,
        values: updatedValues,
        previousValues,
        status
    }).then((entity) => {
        try {
            if (callbacks?.onSaveSuccess) {
                callbacks.onSaveSuccess({
                    schema,
                    path,
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
                callbacks.onSaveFailure({
                    schema,
                    path,
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
