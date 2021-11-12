import { useEffect, useRef, useState } from "react";
import { Entity, EntitySchema, FilterValues } from "../../models";
import { useDataSource } from "./useDataSource";

type Order = "asc" | "desc" | undefined;

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
    schema: EntitySchema<M>;

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
    filterValues?: FilterValues<M>;

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
 * @param schema
 * @param filter
 * @param sortBy
 * @param itemCount
 * @param entitiesDisplayedFirst
 * @category Hooks and utilities
 */
export function useCollectionFetch<M extends { [Key: string]: any }>(
    {
        path,
        schema,
        filterValues,
        sortBy,
        itemCount,
        searchString,
        entitiesDisplayedFirst
    }: CollectionFetchProps<M>): CollectionFetchResult<M> {

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;

    const dataSource = useDataSource();
    const initialEntities = entitiesDisplayedFirst ? entitiesDisplayedFirst.filter(e => !!e.values) : [];
    const [data, setData] = useState<Entity<M>[]>(initialEntities);

    // this is a hack to prevent false updates from Firestore, which returns less data than requested for some reason
    const resetData = useRef<boolean>(false);

    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();
    const [noMoreToLoad, setNoMoreToLoad] = useState<boolean>(false);

    const updateData = (entities: Entity<M>[]) => {
        if (!initialEntities) {
            setData(entities);
        } else {
            const displayedFirstId = new Set(initialEntities.map((e) => e.id));
            setData([...initialEntities, ...entities.filter((e) => !displayedFirstId.has(e.id))]);
        }
    };

    useEffect(() => {
        resetData.current = true;
    }, [path, currentSort, sortByProperty, filterValues, searchString]);

    useEffect(() => {

        setDataLoading(true);

        const onEntitiesUpdate = (entities: Entity<M>[]) => {
            setDataLoading(false);
            setDataLoadingError(undefined);
            if (resetData.current || entities.length >= data.length) {
                resetData.current = false;
                updateData(entities);
            }
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
                schema,
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
                schema,
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
    }, [path, schema, itemCount, currentSort, sortByProperty, filterValues, searchString]);

    return {
        data,
        dataLoading,
        dataLoadingError,
        noMoreToLoad
    };

}
