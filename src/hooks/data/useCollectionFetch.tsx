import { useCallback, useEffect, useMemo, useState } from "react";
import { Entity, EntitySchemaResolver, FilterValues } from "../../models";
import { useDataSource } from "./useDataSource";

/**
 * @category Hooks and utilities
 */
export interface CollectionFetchProps<M extends { [Key: string]: any }> {

    /**
     * Absolute collection path
     */
    path: string;

    /**
     * Schema of the entity displayed by this collection
     */
    schemaResolver: EntitySchemaResolver<M>;

    /**
     * Number of entities to fetch
     */
    itemCount?: number;

    /**
     * List of entities that will be displayed on top, no matter the ordering.
     * This is used for reference fields selection
     */
    entitiesDisplayedFirst?: Entity<M>[];

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
export interface CollectionFetchResult<M extends { [Key: string]: any }> {
    data: Entity<M>[]
    dataLoading: boolean,
    noMoreToLoad: boolean,
    dataLoadingError?: Error
}

/**
 * This hook is used to fetch collections using a given schema
 * @param path
 * @param schemaResolver
 * @param filterValues
 * @param sortBy
 * @param itemCount
 * @param searchString
 * @param entitiesDisplayedFirst
 * @category Hooks and utilities
 */
export function useCollectionFetch<M>(
    {
        path,
        schemaResolver,
        filterValues,
        sortBy,
        itemCount,
        searchString,
        entitiesDisplayedFirst
    }: CollectionFetchProps<M>): CollectionFetchResult<M> {

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;

    const dataSource = useDataSource();
    const initialEntities = useMemo(() => entitiesDisplayedFirst ? entitiesDisplayedFirst.filter(e => !!e.values) : [], [entitiesDisplayedFirst]);
    const [data, setData] = useState<Entity<M>[]>(initialEntities);

    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();
    const [noMoreToLoad, setNoMoreToLoad] = useState<boolean>(false);

    const updateData = useCallback((entities: Entity<M>[]) => {
        if (!initialEntities) {
            setData(entities);
        } else {
            const displayedFirstId = new Set(initialEntities.map((e) => e.id));
            setData([...initialEntities, ...entities.filter((e) => !displayedFirstId.has(e.id))]);
        }
    }, [initialEntities]);

    useEffect(() => {

        setDataLoading(true);

        const onEntitiesUpdate = (entities: Entity<M>[]) => {
            setDataLoading(false);
            setDataLoadingError(undefined);
            updateData(entities);
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
                path: path,
                schema: schemaResolver,
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
                path: path,
                schema: schemaResolver,
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
