import { useEffect, useState } from "react";
import { Entity, EntityCollection, FilterValues, User } from "@rebasepro/types";
import { useData } from "./useData";
import { useCMSUrlController } from "../navigation/contexts";

/**
 * @group Hooks and utilities
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
 * @group Hooks and utilities
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
 * @group Hooks and utilities
 */
export function useCollectionFetch<M extends Record<string, any>, USER extends User>(
    {
        path: inputPath,
        collection,
        filterValues,
        sortBy,
        itemCount,
        searchString
    }: CollectionFetchProps<M>): CollectionFetchResult<M> {
    const dataClient = useData();
    const navigationController = useCMSUrlController();

    const path = navigationController.resolveDatabasePathsFrom(inputPath);

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;
    // Map to PostgREST format for orderBy
    const orderByParams = sortByProperty ? `${String(sortByProperty)}:${currentSort}` : undefined;

    // Convert filterValues to PostgREST where clause
    const whereMap: Record<string, string> = {};
    if (filterValues) {
        Object.entries(filterValues).forEach(([key, value]) => {
            if (value && Array.isArray(value)) {
                const [op, val] = value;
                const postgrestOp = op === "==" ? "eq" : op === "!=" ? "neq" : op === ">" ? "gt" : op === ">=" ? "gte" : op === "<" ? "lt" : op === "<=" ? "lte" : op === "in" ? "in" : op === "not-in" ? "nin" : op === "array-contains" ? "cs" : op === "array-contains-any" ? "csa" : "eq";
                
                let stringVal: string;
                if (Array.isArray(val)) {
                    stringVal = `(${val.join(",")})`;
                } else {
                    stringVal = String(val);
                }
                whereMap[key] = `${postgrestOp}.${stringVal}`;
            }
        });
    }
    const whereParams = Object.keys(whereMap).length > 0 ? whereMap : undefined;

    const [data, setData] = useState<Entity<M>[]>([]);

    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();
    const [noMoreToLoad, setNoMoreToLoad] = useState<boolean>(false);

    useEffect(() => {

        setDataLoading(true);

        const onEntitiesUpdate = async (res: { data: Entity<M>[], meta: { hasMore: boolean } }) => {
            const entities = res.data;
            setDataLoading(false);
            setDataLoadingError(undefined);
            setData(entities.map(e => ({
                ...e,
            })));
            setNoMoreToLoad(!res.meta.hasMore);
        };

        const onError = (error: Error) => {
            console.error("ERROR", error);
            setDataLoading(false);
            setData([]);
            setDataLoadingError(error);
        };

        const accessor = dataClient.collection(path);
        
        if (accessor.listen) {
            return accessor.listen({
                where: whereParams,
                limit: itemCount,
                orderBy: orderByParams,
                searchString
            }, onEntitiesUpdate, onError);
        } else {
            accessor.find({
                where: whereParams,
                limit: itemCount,
                orderBy: orderByParams,
                searchString
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
