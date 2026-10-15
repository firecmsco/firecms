import { DataSource, Entity, EntityCollection, EntityValues, FireCMSContext, SaveEntityProps, User } from "../../types";
import { useDataSource } from "./useDataSource";
import { asError, resolveCollection } from "../../util";

/**
 * Which step of {@link saveEntityWithCallbacks} failed.
 * `pre_save` means `onPreSave` threw and nothing was written.
 * `save` means the datasource write failed.
 * @group Hooks and utilities
 */
export type EntitySaveStage = "pre_save" | "save";

/**
 * Rejection from {@link saveEntityWithCallbacks}.
 * `cause` is the original error. Callbacks still receive that original error.
 * @group Hooks and utilities
 */
export class EntitySaveError extends Error {
    readonly stage: EntitySaveStage;

    constructor(stage: EntitySaveStage, cause: Error) {
        super(cause.message, { cause });
        this.name = "EntitySaveError";
        this.stage = stage;
    }
}

/**
 * @group Hooks and utilities
 */
export type SaveEntityWithCallbacksProps<M extends Record<string, any>> =
    SaveEntityProps<M> &
    {
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
 * @group Hooks and utilities
 */
export async function saveEntityWithCallbacks<M extends Record<string, any>, USER extends User>({
                                                                                                    collection,
                                                                                                    path,
                                                                                                    pathSegments,
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
                                                                                                    collection: EntityCollection<M, USER>,
                                                                                                    dataSource: DataSource,
                                                                                                    context: FireCMSContext,
                                                                                                }
): Promise<void> {

    if (status !== "new" && !entityId) {
        throw new Error("Entity id must be specified when updating an existing entity");
    }
    let updatedValues: Partial<EntityValues<M>>;

    const customizationController = context.customizationController;

    const resolvedPath = context.navigation.resolveIdsFrom(path, pathSegments);

    const callbacks = collection.callbacks;
    if (callbacks?.onPreSave) {
        try {
            const resolvedCollection = resolveCollection<M>({
                collection,
                path,
                values: previousValues as EntityValues<M>,
                entityId,
                propertyConfigs: customizationController.propertyConfigs,
                authController: context.authController
            });
            updatedValues = await callbacks.onPreSave({
                collection: resolvedCollection,
                path,
                pathSegments,
                resolvedPath,
                entityId,
                values,
                previousValues,
                status,
                context
            });
        } catch (e: any) {
            console.error(e);
            const error = asError(e);
            if (onPreSaveHookError)
                onPreSaveHookError(error);
            throw new EntitySaveError("pre_save", error);
        }
    } else {
        updatedValues = values;
    }

    return dataSource.saveEntity({
        collection,
        path: resolvedPath,
        pathSegments,
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
                    propertyConfigs: customizationController.propertyConfigs,
                    authController: context.authController
                });
                callbacks.onSaveSuccess({
                    collection: resolvedCollection,
                    path,
                    pathSegments,
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
                    propertyConfigs: customizationController.propertyConfigs,
                    authController: context.authController
                });
                callbacks.onSaveFailure({
                    collection: resolvedCollection,
                    path,
                    pathSegments,
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
