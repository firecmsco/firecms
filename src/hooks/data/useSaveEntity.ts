import {
    DataSource,
    Entity,
    EntityValues,
    SaveEntityProps
} from "../../models";
import { CMSAppContext, useCMSAppContext } from "../../contexts";
import { useEffect } from "react";
import { useDataSource } from "./useDataSource";

export type SaveEntityWithCallbacksProps<M> =
    SaveEntityProps<M> &
    {
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
 * @param values
 * @param status
 * @param onSaveSuccess
 * @param onSaveFailure
 * @param onPreSaveHookError
 * @param onSaveSuccessHookError
 */
export function useSaveEntity<M extends { [Key: string]: any }>({
                                                                    schema,
                                                                    path,
                                                                    entityId,
                                                                    values,
                                                                    status,
                                                                    onSaveSuccess,
                                                                    onSaveFailure,
                                                                    onPreSaveHookError,
                                                                    onSaveSuccessHookError
                                                                }: SaveEntityWithCallbacksProps<M>) {

    const dataSource = useDataSource();
    const context = useCMSAppContext();
    useEffect(() => {
        saveEntityWithCallbacks(
            {
                dataSource,
                context,
                schema,
                path,
                entityId,
                values,
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
 * @param values
 * @param status
 * @param dataSource
 * @param context
 * @param onSaveSuccess
 * @param onSaveFailure
 * @param onPreSaveHookError
 * @param onSaveSuccessHookError
 * @see useDataSource
 * @see useSaveEntity
 */
export async function saveEntityWithCallbacks<M>({
                                                schema,
                                                path,
                                                entityId,
                                                values,
                                                status,
                                                dataSource,
                                                context,
                                                onSaveSuccess,
                                                onSaveFailure,
                                                onPreSaveHookError,
                                                onSaveSuccessHookError
                                            }: SaveEntityWithCallbacksProps<M> & {
                                                dataSource: DataSource,
                                                context: CMSAppContext,
                                            }
): Promise<void> {

    let updatedValues: Partial<EntityValues<M>>;

    if (schema.onPreSave) {
        try {
            updatedValues = await schema.onPreSave({
                schema,
                path,
                entityId,
                values,
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
        status
    }).then((entity) => {
        try {
            if (schema.onSaveSuccess) {
                schema.onSaveSuccess({
                    schema,
                    path,
                    entityId,
                    values: updatedValues,
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
            if (schema.onSaveFailure) {
                schema.onSaveFailure({
                    schema,
                    path,
                    entityId,
                    values: updatedValues,
                    status,
                    context
                });
            }
            if (onSaveFailure) onSaveFailure(e);
        });
}
