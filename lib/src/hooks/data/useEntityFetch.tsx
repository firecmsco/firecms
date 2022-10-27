import { useEffect, useState } from "react";
import { Entity, EntityCollection, FireCMSContext, User } from "../../types";
import { useDataSource } from "./useDataSource";
import { useNavigationContext } from "../useNavigationContext";
import { useFireCMSContext } from "../useFireCMSContext";

/**
 * @category Hooks and utilities
 */
export interface EntityFetchProps<M extends Record<string, any>> {
    path: string;
    entityId?: string;
    collection: EntityCollection<M>;
    useCache?: boolean;
}

/**
 * @category Hooks and utilities
 */
export interface EntityFetchResult<M extends Record<string, any>> {
    entity?: Entity<M>,
    dataLoading: boolean,
    dataLoadingError?: Error
}

const CACHE:Record<string, Entity<any>| undefined> = {};

/**
 * This hook is used to fetch an entity.
 * It gives real time updates if the datasource supports it.
 * @param path
 * @param collection
 * @param entityId
 * @param useCache
 * @category Hooks and utilities
 */

export function useEntityFetch<M extends Record<string, any>, UserType extends User>(
    {
        path: inputPath,
        entityId,
        collection,
        useCache = false
    }: EntityFetchProps<M>): EntityFetchResult<M> {

    const dataSource = useDataSource();
    const navigationContext = useNavigationContext();

    const path = navigationContext.resolveAliasesFrom(inputPath);

    const context: FireCMSContext<UserType> = useFireCMSContext();

    const [entity, setEntity] = useState<Entity<M> | undefined>();
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();

    useEffect(() => {

        setDataLoading(true);

        const onEntityUpdate = async (updatedEntity: Entity<M> | undefined) => {
            if (collection.callbacks?.onFetch && updatedEntity) {
                try {
                    updatedEntity = await collection.callbacks.onFetch({
                        collection,
                        path,
                        entity: updatedEntity,
                        context
                    });
                } catch (e: any) {
                    console.error(e);
                }
            }
            CACHE[`${path}/${entityId}`] = updatedEntity;
            setEntity(updatedEntity);
            setDataLoading(false);
            setDataLoadingError(undefined);
        };

        const onError = (error: Error) => {
            console.error("ERROR fetching entity", error);
            setDataLoading(false);
            setEntity(undefined);
            setDataLoadingError(error);
        };

        if (entityId && useCache && CACHE[`${path}/${entityId}`]) {
            setEntity(CACHE[`${path}/${entityId}`]);
            setDataLoading(false);
            setDataLoadingError(undefined);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return () => {
            };
        } else if (entityId && path && collection) {
            if (dataSource.listenEntity) {
                return dataSource.listenEntity<M>({
                    path,
                    entityId,
                    collection,
                    onUpdate: onEntityUpdate,
                    onError
                });
            } else {
                dataSource.fetchEntity<M>({
                    path,
                    entityId,
                    collection
                })
                    .then(onEntityUpdate)
                    .catch(onError);
                return () => {
                };
            }
        }
        // if no entityId is provided we do nothing
        else {
            onEntityUpdate(undefined);
            return () => {
            };
        }
    }, [entityId, path]);

    return {
        entity,
        dataLoading,
        dataLoadingError
    };

}
