import { useEffect, useState } from "react";
import { Entity, EntityCollection, RebaseContext, User } from "@rebasepro/types";
import { useDataSource } from "./useDataSource";
import { useCMSUrlController } from "../navigation/contexts";
import { useRebaseContext } from "../useRebaseContext";

/**
 * @group Hooks and utilities
 */
export interface EntityFetchProps<M extends Record<string, any>, USER extends User = User> {
    path: string;
    entityId?: string | number;
    databaseId?: string;
    collection: EntityCollection<M, USER>;
    useCache?: boolean;
}

/**
 * @group Hooks and utilities
 */
export interface EntityFetchResult<M extends Record<string, any>> {
    entity?: Entity<M>,
    dataLoading: boolean,
    dataLoadingError?: Error
}

const CACHE: Record<string, Entity<any> | undefined> = {};

/**
 * This hook is used to fetch an entity.
 * It gives real time updates if the datasource supports it.
 * @param path
 * @param collection
 * @param entityId
 * @param useCache
 * @group Hooks and utilities
 */

export function useEntityFetch<M extends Record<string, any>, USER extends User>(
    {
        path: inputPath,
        entityId,
        collection,
        databaseId,
        useCache = false
    }: EntityFetchProps<M, USER>): EntityFetchResult<M> {

    const dataSource = useDataSource(collection);
    const navigationController = useCMSUrlController();

    const path = navigationController.resolveDatabasePathsFrom(inputPath);

    const context: RebaseContext<USER> = useRebaseContext();

    const [entity, setEntity] = useState<Entity<M> | undefined>();
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();

    useEffect(() => {

        setDataLoading(true);

        const onEntityUpdate = async (updatedEntity?: Entity<M> | null) => {
            CACHE[`${path}/${entityId}`] = updatedEntity ?? undefined;
            setEntity(updatedEntity ?? undefined);
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
                    databaseId,
                    collection,
                    onUpdate: onEntityUpdate,
                    onError
                });
            } else {
                dataSource.fetchEntity<M>({
                    path,
                    entityId,
                    databaseId,
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
