import React, { useCallback, useEffect, useMemo, useState } from "react";

import { useDataSource, useFireCMSContext, useNavigationController } from "../../hooks";
import { useDataOrder } from "../../hooks/data/useDataOrder";
import {
    Entity,
    EntityCollection,
    EntityTableController,
    FilterValues,
    FireCMSContext,
    SelectedCellProps,
    User
} from "../../types";
import { useDebouncedData } from "./useDebouncedData";
import equal from "react-fast-compare"
import { ScrollRestorationController } from "./useScrollRestoration";

const DEFAULT_PAGE_SIZE = 50;

export type DataSourceTableControllerProps<M extends Record<string, any> = any> = {
    /**
     * Full path where the data of this table is located
     */
    fullPath: string;
    /**
     * The collection that is represented by this config.
     */
    collection: EntityCollection<M>;
    /**
     * List of entities that will be displayed on top, no matter the ordering.
     * This is used for reference fields selection
     */
    entitiesDisplayedFirst?: Entity<M>[];

    lastDeleteTimestamp?: number;

    /**
     * Force filter to be applied to the table.
     */
    forceFilter?: FilterValues<string>;

    scrollRestoration?: ScrollRestorationController;

}

/**
 * Use this hook to build a controller for the {@link EntityCollectionTable}.
 * This controller is bound to data in a path in your specified datasource.
 *
 * Note that you can build your own hook returning a {@link EntityTableController}
 * if you would like to display different data.
 *
 * @param fullPath
 * @param collection
 * @param scrollRestoration
 * @param entitiesDisplayedFirst
 * @param lastDeleteTimestamp
 * @param forceFilterFromProps
 */
export function useDataSourceTableController<M extends Record<string, any> = any, USER extends User = User>(
    {
        fullPath,
        collection,
        scrollRestoration,
        entitiesDisplayedFirst,
        lastDeleteTimestamp,
        forceFilter: forceFilterFromProps,
    }: DataSourceTableControllerProps<M>)
    : EntityTableController<M> {

    const {
        initialFilter,
        initialSort,
        forceFilter: forceFilterFromCollection
    } = collection;

    const [popupCell, setPopupCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);
    const navigation = useNavigationController();
    const dataSource = useDataSource(collection);
    const resolvedPath = useMemo(() => navigation.resolveAliasesFrom(fullPath), [fullPath, navigation.resolveAliasesFrom]);

    const forceFilter = forceFilterFromProps ?? forceFilterFromCollection;
    const paginationEnabled = collection.pagination === undefined || Boolean(collection.pagination);
    const pageSize = typeof collection.pagination === "number" ? collection.pagination : DEFAULT_PAGE_SIZE;

    const [searchString, setSearchString] = React.useState<string | undefined>();

    const checkFilterCombination = useCallback((filterValues: FilterValues<any>,
                                                sortBy?: [string, "asc" | "desc"]) => {
        if (!dataSource.isFilterCombinationValid)
            return true;
        return dataSource.isFilterCombinationValid({
            path: resolvedPath,
            collection,
            filterValues,
            sortBy
        })
    }, []);

    const onScroll = ({
                          scrollOffset
                      }: {
        scrollOffset: number
    }) => {
        if (scrollRestoration) {
            scrollRestoration.updateCollectionScroll({
                fullPath: resolvedPath,
                scrollOffset,
                data: rawData,
                filters: filterValues
            });
        }
    }

    const initialSortInternal = useMemo(() => {
        if (initialSort && forceFilter && !checkFilterCombination(forceFilter, initialSort)) {
            console.warn("Initial sort is not compatible with the force filter. Ignoring initial sort");
            return undefined;
        }
        return initialSort;
    }, [initialSort, forceFilter]);

    useEffect(() => {
        if (!equal(forceFilter, filterValues)) {
            setFilterValues(forceFilter)
        }
    }, [forceFilter]);

    const [filterValues, setFilterValues] = React.useState<FilterValues<Extract<keyof M, string>> | undefined>(forceFilter ?? initialFilter ?? undefined);
    const [sortBy, setSortBy] = React.useState<[Extract<keyof M, string>, "asc" | "desc"] | undefined>(initialSortInternal);

    const collectionScroll = scrollRestoration?.getCollectionScroll(fullPath, filterValues);
    const initialItemCount = collectionScroll?.data.length ?? pageSize;

    const [itemCount, setItemCount] = React.useState<number | undefined>(paginationEnabled ? initialItemCount : undefined);

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;

    const context: FireCMSContext<USER> = useFireCMSContext();

    const [rawData, setRawData] = useState<Entity<M>[]>(collectionScroll?.data ?? []);

    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();
    const [noMoreToLoad, setNoMoreToLoad] = useState<boolean>(false);

    const clearFilter = useCallback(() => setFilterValues(forceFilter ?? undefined), [forceFilter]);

    const updateFilterValues = useCallback((updatedFilter: FilterValues<Extract<keyof M, string>> | undefined) => {
        if (forceFilter) {
            console.warn("Filter is not compatible with the force filter. Ignoring filter");
            return;
        }
        if (updatedFilter && Object.keys(updatedFilter).length === 0) {
            setFilterValues(undefined);
        } else {
            setFilterValues(updatedFilter);
        }
    }, [forceFilter]);

    useEffect(() => {

        setDataLoading(true);

        const onEntitiesUpdate = async (entities: Entity<M>[]) => {
            if (collection.callbacks?.onFetch) {
                try {
                    entities = await Promise.all(
                        entities.map((entity) =>
                            collection.callbacks!.onFetch!({
                                collection,
                                path: resolvedPath,
                                entity,
                                context
                            })));
                } catch (e: any) {
                    console.error(e);
                }
            }
            setDataLoading(false);
            setDataLoadingError(undefined);
            setRawData(entities.map(e => ({
                ...e,
                // values: sanitizeData(e.values, resolvedCollection.properties)
            })));
            setNoMoreToLoad(!itemCount || entities.length < itemCount);
        };

        const onError = (error: Error) => {
            console.error("ERROR", error);
            setDataLoading(false);
            setRawData([]);
            setDataLoadingError(error);
        };

        if (dataSource.listenCollection) {
            return dataSource.listenCollection<M>({
                path: resolvedPath,
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
                path: resolvedPath,
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
    }, [resolvedPath, itemCount, currentSort, sortByProperty, filterValues, searchString]);

    const orderedData = useDataOrder({
        data: rawData,
        entitiesDisplayedFirst
    });

    // hack to fix Firestore listeners firing with incomplete data
    const data = useDebouncedData(orderedData, {
        filterValues,
        sortBy,
        searchString,
        lastDeleteTimestamp
    });

    return {
        data,
        dataLoading,
        noMoreToLoad,
        dataLoadingError,
        filterValues,
        setFilterValues: updateFilterValues,
        sortBy,
        setSortBy,
        searchString,
        setSearchString,
        clearFilter,
        itemCount,
        setItemCount,
        initialScroll: collectionScroll?.scrollOffset,
        onScroll,
        paginationEnabled,
        pageSize,
        checkFilterCombination,
        popupCell,
        setPopupCell
    }
}
