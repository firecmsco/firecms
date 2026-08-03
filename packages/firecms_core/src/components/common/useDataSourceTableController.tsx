import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { useDataSource, useFireCMSContext, useNavigationController } from "../../hooks";
import { useDataOrder } from "../../hooks/data/useDataOrder";
import {
    DataType,
    Entity,
    EntityCollection,
    EntityTableController,
    FilterValues,
    FireCMSContext,
    SelectedCellProps,
    User
} from "../../types";
import { useDebouncedData } from "./useDebouncedData";
import { ScrollRestorationController } from "./useScrollRestoration";
import { isDataTypeFilterable } from "../../util";
import { encodeFilterAndSort, parseFilterAndSort } from "./table_url_params";

const DEFAULT_PAGE_SIZE = 50;

export type DataSourceTableControllerProps<M extends Record<string, any> = any> = {
    /**
     * Full path where the data of this table is located
     */
    fullPath: string;
    /**
     * `fullPath` split at its real segment boundaries. Passed through to the datasource so
     * a parent entity id containing "/" stays unambiguous.
     *
     * Optional, and never derived by splitting `fullPath` — a guess would be wrong in
     * exactly the case the field exists for. Absent means "not known here", not "no slashes".
     */
    pathSegments?: string[];
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

    /**
     * When set to true the filters and sort will be updated in the URL
     */
    updateUrl?: boolean;

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
 * @param updateUrl
 */
export function useDataSourceTableController<M extends Record<string, any> = any, USER extends User = User>(
    {
        fullPath,
        pathSegments,
        collection,
        scrollRestoration,
        entitiesDisplayedFirst,
        lastDeleteTimestamp,
        forceFilter: forceFilterFromProps,
        updateUrl
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
    const resolvedPath = useMemo(() => navigation.resolveIdsFrom(fullPath), [fullPath, navigation.resolveIdsFrom]);
    // Passed through as-is; never derived from `resolvedPath` (see useEntityFetch).
    const resolvedPathSegments = pathSegments;

    const forceFilter = forceFilterFromProps ?? forceFilterFromCollection;
    const paginationEnabled = collection.pagination === undefined || Boolean(collection.pagination);
    const pageSize = typeof collection.pagination === "number" ? collection.pagination : DEFAULT_PAGE_SIZE;

    const checkFilterCombination = useCallback((filterValues: FilterValues<any>,
        sortBy?: [string, "asc" | "desc"]) => {
        if (!dataSource.isFilterCombinationValid)
            return true;
        return dataSource.isFilterCombinationValid({
            path: resolvedPath,
            pathSegments: resolvedPathSegments,
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

    const location = useLocation();

    const {
        filterValues: initialFilterUrl,
        sortBy: initialSortUrl,
        searchString: initialSearchUrl
    } = parseFilterAndSort(location.search);

    const availableFilterKeys = collection.allowedFilters ?? Object.keys(collection.properties);
    const forcedFilterKeys = collection.forceFilter ? Object.keys(collection.forceFilter) : [];

    const allowedFilterKeys = useMemo(() => {
        const availableKeys = availableFilterKeys.filter((key) => {
            const property = collection.properties[key];

            if (!property) return false;

            if (typeof property === "function") return false;

            const dataType = property.dataType;
            const filterable = dataType === "array"
                ? isDataTypeFilterable((property as { of?: { dataType: DataType } }).of?.dataType as DataType, true)
                : isDataTypeFilterable(dataType);

            return filterable;
        });

        const forcedKeys = forcedFilterKeys.filter((key) => !availableKeys.includes(key));

        return [...availableKeys, ...forcedKeys];

    }, [collection.properties, availableFilterKeys, forcedFilterKeys]);

    const removeUnallowedFilters = useCallback((filters?: FilterValues<Extract<keyof M, string>>) => {
        if (!filters) return;

        return Object.fromEntries(Object.entries(filters).filter(([key]) => allowedFilterKeys.includes(key as keyof M)))  as FilterValues<Extract<keyof M, string>>;
    }, [allowedFilterKeys]);

    const initFilters = forceFilter ?? (updateUrl ? initialFilterUrl : undefined) ?? initialFilter ?? undefined

    const [filterValues, setFilterValues] = React.useState<FilterValues<Extract<keyof M, string>> | undefined>(removeUnallowedFilters(initFilters));
    const [sortBy, setSortBy] = React.useState<[Extract<keyof M, string>, "asc" | "desc"] | undefined>((updateUrl ? initialSortUrl : undefined) ?? initialSortInternal);
    // Like the filters and the sort, the text search term is only restored from the URL when
    // this controller owns the URL. Controllers rendered inside a dialog (e.g. a reference
    // selection dialog) get `updateUrl: false` and must not inherit the state of the
    // collection behind them. See https://github.com/firecmsco/firecms/issues/702
    const [searchString, setSearchString] = React.useState<string | undefined>(updateUrl ? initialSearchUrl : undefined);

    useUpdateUrl(filterValues, sortBy, searchString, updateUrl);

    const collectionScroll = scrollRestoration?.getCollectionScroll(fullPath, filterValues);
    const initialItemCount = collectionScroll?.data.length ?? pageSize;

    useEffect(() => {
        if (scrollRestoration) {
            scrollRestoration.updateCollectionScroll({
                fullPath: resolvedPath,
                scrollOffset: collectionScroll?.scrollOffset ?? 0,
                data: rawData,
                filters: filterValues
            });
        }
    }, []);

    const [itemCount, setItemCount] = React.useState<number | undefined>(paginationEnabled ? initialItemCount : undefined);

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;

    const context: FireCMSContext<USER> = useFireCMSContext();

    const [rawData, setRawData] = useState<Entity<M>[]>(collectionScroll?.data ?? []);

    const [dataLoading, setDataLoading] = useState<boolean>(false);
    const [dataLoadingError, setDataLoadingError] = useState<Error | undefined>();
    const [noMoreToLoad, setNoMoreToLoad] = useState<boolean>(false);

    const clearFilter = useCallback(() => setFilterValues(removeUnallowedFilters(forceFilter)), [forceFilter, removeUnallowedFilters]);

    const updateFilterValues = useCallback((updatedFilter: FilterValues<Extract<keyof M, string>> | undefined) => {
        if (forceFilter) {
            console.warn("Filter is not compatible with the force filter. Ignoring filter");
            return;
        }
        if (updatedFilter && Object.keys(updatedFilter).length === 0) {
            setFilterValues(undefined);
        } else {
            setFilterValues(removeUnallowedFilters(updatedFilter));
        }
    }, [forceFilter, removeUnallowedFilters]);

    useEffect(() => {

        setDataLoading(true);

        const onEntitiesUpdate = async (entities: Entity<M>[]) => {
            // See useEntityFetch: entities carry the segments they were loaded with, so a
            // reference or a delete derived from a table row stays resolvable.
            if (resolvedPathSegments) {
                entities = entities.map(e => e.pathSegments ? e : { ...e, pathSegments: resolvedPathSegments });
            }
            if (collection.callbacks?.onFetch) {
                try {
                    entities = await Promise.all(
                        entities.map((entity) =>
                            collection.callbacks!.onFetch!({
                                collection,
                                path: resolvedPath,
                                pathSegments: resolvedPathSegments,
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

        // Data sources may throw synchronously, e.g. when a text search is requested before
        // the text search backend of the collection has been initialised. That can happen
        // when the search term is restored from the URL instead of typed in the search bar,
        // so it is reported as a data loading error rather than being left to blow up the
        // whole view from inside this effect.
        try {
            if (dataSource.listenCollection) {
                return dataSource.listenCollection<M>({
                    path: resolvedPath,
                    pathSegments: resolvedPathSegments,
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
                    pathSegments: resolvedPathSegments,
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
        } catch (e: any) {
            onError(e instanceof Error ? e : new Error(String(e)));
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
        allowedFilters: allowedFilterKeys,
        forcedFilters: forcedFilterKeys,
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

function useUpdateUrl<M extends Record<string, any> = any>(
    filterValues: FilterValues<Extract<keyof M, string>> | undefined,
    sortBy: [Extract<keyof M, string>, "asc" | "desc"] | undefined,
    searchString: string | undefined,
    updateUrl: boolean | undefined
) {

    useEffect(() => {
        if (updateUrl) {
            const state = encodeFilterAndSort(filterValues, sortBy, searchString);
            const hash = window.location.hash;
            if (state === "")
                window.history.replaceState({}, "", `${window.location.pathname}${hash}`);
            else
                window.history.replaceState({}, "", `?${state}${hash}`);
        }
    }, [filterValues, sortBy, searchString, updateUrl]);
}
