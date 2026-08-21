import { useEffect, useState } from "react";
import { Entity, EntityCollection, FireCMSContext, User } from "../../types";
import { useDataSource } from "./useDataSource";
import { useNavigationController } from "../useNavigationController";
import { useFireCMSContext } from "../useFireCMSContext";
import { entityCacheKey } from "../../util/entity_cache";

/**
 * @group Hooks and utilities
 */
export interface EntityFetchProps<M extends Record<string, any>, USER extends User = User> {
    path: string;
    /**
     * `path` split at its real segment boundaries. Forwarded to the datasource so a parent
     * entity id containing "/" stays unambiguous.
     *
     * Optional, and never derived by splitting `path` — a guess would be wrong in exactly
     * the case the field exists for. Absent means "not known here", not "no slashes".
     */
    pathSegments?: string[];
    entityId?: string;
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
        pathSegments: inputPathSegments,
        entityId,
        collection,
        databaseId,
        useCache = false
    }: EntityFetchProps<M, USER>): EntityFetchResult<M> {

    const dataSource = useDataSource(collection);
    const navigationController = useNavigationController();

    // Never fabricate segments. If the caller did not thread them, pass undefined so a
    // delegate can tell "not provided" from a real answer — splitting `path` here would
    // produce a confidently wrong array for any id containing "/".
    //
    // When they were threaded, both representations are resolved from them together, so
    // `path` cannot end up describing a different chain than `pathSegments`.
    // `resolveSegmentsFrom` is optional on the controller: a host app may be supplying one
    // built against an earlier version. Falling back to the segments as given is what
    // happened before it existed — they are used unresolved, never invented.
    const pathSegments = inputPathSegments
        ? (navigationController.resolveSegmentsFrom?.(inputPathSegments) ?? inputPathSegments)
        : undefined;
    const path = navigationController.resolveIdsFrom(inputPath, inputPathSegments);

    const context: FireCMSContext<USER> = useFireCMSContext();

    const [entity, setEntity] = useState<Entity<M> | undefined>();
    const [dataLoading, setDataLoading] = useState<boolean>(true);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();

    useEffect(() => {

        setDataLoading(true);

        const onEntityUpdate = async (updatedEntity: Entity<M> | undefined) => {
            // Attach the segments this entity was loaded with, so anything derived from it
            // later — a reference, a delete — stays resolvable without re-deriving them
            // from the flattened path. Delegates are not required to set this themselves.
            if (updatedEntity && pathSegments && !updatedEntity.pathSegments) {
                updatedEntity = { ...updatedEntity, pathSegments };
            }
            if (collection.callbacks?.onFetch && updatedEntity) {
                try {
                    updatedEntity = await collection.callbacks.onFetch({
                        collection,
                        path,
                        pathSegments,
                        entity: updatedEntity,
                        context
                    });
                } catch (e: any) {
                    console.error(e);
                }
            }
            CACHE[entityCacheKey(path, entityId)] = updatedEntity;
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

        if (entityId && useCache && CACHE[entityCacheKey(path, entityId)]) {
            setEntity(CACHE[entityCacheKey(path, entityId)]);
            setDataLoading(false);
            setDataLoadingError(undefined);
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return () => {
            };
        } else if (entityId && path && collection) {
            if (dataSource.listenEntity) {
                return dataSource.listenEntity<M>({
                    path,
                    pathSegments,
                    entityId,
                    databaseId,
                    collection,
                    onUpdate: onEntityUpdate,
                    onError
                });
            } else {
                dataSource.fetchEntity<M>({
                    path,
                    pathSegments,
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
