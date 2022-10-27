import { useEffect, useState } from "react";
import {
    Entity,
    EntityCollection,
    FilterValues,
    FireCMSContext,
    User
} from "../../types";
import { useDataSource } from "./useDataSource";
import { useNavigationContext } from "../useNavigationContext";
import { useFireCMSContext } from "../useFireCMSContext";

/**
 * @category Hooks and utilities
 */
export interface CollectionFetchProps<M extends Record<string, any>> {

    /**
     * Absolute collection path
     */
    path: string;

    /**
     * collection of the entity displayed by this collection
     */
    collection: EntityCollection<M>

    /**
     * Number of entities to fetch
     */
    itemCount?: number;

    /**
     * Filter the fetched data by the property
     */
    filterValues?: FilterValues<Extract<keyof M, string>>;

    /**
     * Sort the results by
     */
    sortBy?: [Extract<keyof M, string>, "asc" | "desc"];

    /**
     * Search string
     */
    searchString?: string;
}

/**
 * @category Hooks and utilities
 */
export interface CollectionFetchResult<M extends Record<string, any>> {
    data: Entity<M>[];
    dataLoading: boolean;
    noMoreToLoad: boolean;
    dataLoadingError?: Error;
}

/**
 * This hook is used to fetch collections using a given collection
 * @param path
 * @param collection
 * @param filterValues
 * @param sortBy
 * @param itemCount
 * @param searchString
 * @category Hooks and utilities
 */
export function useCollectionFetch<M extends Record<string, any>, UserType extends User>(
    {
        path: inputPath,
        collection,
        filterValues,
        sortBy,
        itemCount,
        searchString
    }: CollectionFetchProps<M>): CollectionFetchResult<M> {

    const dataSource = useDataSource();
    const navigationContext = useNavigationContext();

    const path = navigationContext.resolveAliasesFrom(inputPath);

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;

    const context: FireCMSContext<UserType> = useFireCMSContext();

    const [data, setData] = useState<Entity<M>[]>([]);

    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();
    const [noMoreToLoad, setNoMoreToLoad] = useState<boolean>(false);

    useEffect(() => {

        setDataLoading(true);

        const onEntitiesUpdate = async (entities: Entity<M>[]) => {
            if (collection.callbacks?.onFetch) {
                try {
                    entities = await Promise.all(
                        entities.map((entity) =>
                            collection.callbacks!.onFetch!({
                                collection,
                                path,
                                entity,
                                context
                            })));
                } catch (e: any) {
                    console.error(e);
                }
            }
            setDataLoading(false);
            setDataLoadingError(undefined);
            setData(entities);
            setNoMoreToLoad(!itemCount || entities.length < itemCount);
        };

        const onError = (error: Error) => {
            console.error("ERROR", error);
            setDataLoading(false);
            setData([]);
            setDataLoadingError(error);
        };

        if (dataSource.listenCollection) {
            return dataSource.listenCollection<M>({
                path,
                collection,
                onUpdate: onEntitiesUpdate,
                onError,
                searchString,
                filter: filterValues,
                limit: itemCount,
                startAfter: undefined,
                orderBy: sortByProperty,
                order: currentSort
            });
        } else {
            dataSource.fetchCollection<M>({
                path,
                collection,
                searchString,
                filter: filterValues,
                limit: itemCount,
                startAfter: undefined,
                orderBy: sortByProperty,
                order: currentSort
            })
                .then(onEntitiesUpdate)
                .catch(onError);
            return () => {
            };
        }
    }, [path, itemCount, currentSort, sortByProperty, filterValues, searchString]);

    return {
        data,
        dataLoading,
        dataLoadingError,
        noMoreToLoad
    };

}
