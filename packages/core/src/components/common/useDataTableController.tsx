import type { EntityCollection } from "@rebasepro/types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import { useData, useRebaseContext } from "../../hooks";
import { useDataOrder } from "../../hooks/data/useDataOrder";
import { Entity, EntityReference, EntityRelation, EntityTableController, FilterValues, RebaseContext, SelectedCellProps, User, WhereFilterOp, FindResponse } from "@rebasepro/types";
import { ScrollRestorationController } from "./useScrollRestoration";

export const DEFAULT_PAGE_SIZE = 50;

export type DataTableControllerProps<M extends Record<string, any> = any> = {
    /**
     * Full path where the data of this table is located
     */
    path: string;
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
 * This controller is bound to data in a path in your specified driver.
 *
 * Note that you can build your own hook returning a {@link EntityTableController}
 * if you would like to display different data.
 *
 * @param path
 * @param collection
 * @param scrollRestoration
 * @param entitiesDisplayedFirst
 * @param lastDeleteTimestamp
 * @param forceFilterFromProps
 * @param updateUrl
 */
export function useDataTableController<M extends Record<string, any> = any, USER extends User = User>(
    {
        path,
        collection,
        scrollRestoration,
        entitiesDisplayedFirst,
        lastDeleteTimestamp: _lastDeleteTimestamp,
        forceFilter: forceFilterFromProps,
        updateUrl
    }: DataTableControllerProps<M>)
    : EntityTableController<M> {

    const {
        filter,
        sort,
        forceFilter: forceFilterFromCollection
    } = collection;

    const [popupCell, setPopupCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);
    const dataClient = useData();

    const forceFilter = forceFilterFromProps ?? forceFilterFromCollection;
    const paginationEnabled = collection.pagination === undefined || Boolean(collection.pagination);
    const pageSize = typeof collection.pagination === "number" ? collection.pagination : DEFAULT_PAGE_SIZE;

    const [searchString, setSearchString] = React.useState<string | undefined>();

    const checkFilterCombination = useCallback((filterValues: FilterValues<any>,
        sortBy?: [string, "asc" | "desc"]) => {
        // PostgREST/SQL can handle arbitrary filter/sort combinations natively.
        return true;
    }, []);

    const onScroll = ({
        scrollOffset
    }: {
        scrollOffset: number
    }) => {
        if (scrollRestoration) {
            scrollRestoration.updateCollectionScroll({
                path,
                scrollOffset,
                data: rawData,
                filters: filterValues
            });
        }
    }

    const sortInternal = useMemo(() => {
        if (sort && forceFilter && !checkFilterCombination(forceFilter, sort)) {
            console.warn("Initial sort is not compatible with the force filter. Ignoring initial sort");
            return undefined;
        }
        return sort;
    }, [sort, forceFilter]);

    const location = useLocation();

    const {
        filterValues: filterUrl,
        sortBy: sortUrl
    } = parseFilterAndSort(location.search);

    const [filterValues, setFilterValues] = React.useState<FilterValues<Extract<keyof M, string>> | undefined>(forceFilter ?? (updateUrl ? filterUrl : undefined) ?? filter ?? undefined);
    const [sortBy, setSortBy] = React.useState<[Extract<keyof M, string>, "asc" | "desc"] | undefined>((updateUrl ? sortUrl : undefined) ?? sortInternal);

    // Sync filter/sort state from URL on browser navigation (back/forward).
    // Skip initial mount since useState initializers already handle URL params + collection defaults.
    const initialSearchRef = React.useRef<string | null>(location.search);
    useEffect(() => {
        if (!updateUrl) return;
        // Skip the initial mount - useState already set the correct values
        if (initialSearchRef.current !== null && initialSearchRef.current === location.search) {
            initialSearchRef.current = null;
            return;
        }
        initialSearchRef.current = null;

        const { filterValues: urlFilterValues, sortBy: urlSortBy } = parseFilterAndSort(location.search);
        if (!forceFilter) {
            setFilterValues(urlFilterValues as FilterValues<Extract<keyof M, string>> | undefined);
        }
        if (urlSortBy && forceFilter && !checkFilterCombination(forceFilter, urlSortBy)) {
            console.warn("URL sort is not compatible with the force filter.");
        } else {
            setSortBy(urlSortBy as [Extract<keyof M, string>, "asc" | "desc"] | undefined);
        }
    }, [location.search, updateUrl, forceFilter, checkFilterCombination]);

    useUpdateUrl(filterValues, sortBy, searchString, updateUrl);

    const collectionScroll = scrollRestoration?.getCollectionScroll(path, filterValues);
    const initialItemCount = collectionScroll?.data.length ?? pageSize;

    useEffect(() => {
        if (scrollRestoration) {
            scrollRestoration.updateCollectionScroll({
                path,
                scrollOffset: collectionScroll?.scrollOffset ?? 0,
                data: rawData,
                filters: filterValues
            });
        }
    }, []);

    const [itemCount, setItemCount] = React.useState<number | undefined>(paginationEnabled ? initialItemCount : undefined);

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;

    const context: RebaseContext<USER> = useRebaseContext();

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
            if (collection.callbacks?.afterRead) {
                try {
                    entities = await Promise.all(
                        entities.map((entity) =>
                            collection.callbacks!.afterRead!({
                                collection,
                                path,
                                entity,
                                context
                            })));
                } catch (_e: unknown) {
                    console.error(_e);
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

        const accessor = dataClient.collection(path);
        
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
        const orderByParams = sortByProperty ? `${String(sortByProperty)}:${currentSort}` : undefined;

        // Note: For now, offset is determined based on how many elements we already have.
        // Actually, this is a table controller; fetching the whole list up to itemCount is how it worked.
        // So offset: 0, limit: itemCount.
        
        let unsubscribe: (() => void) | undefined;
        
        if (accessor.listen) {
            unsubscribe = accessor.listen({
                where: whereParams,
                limit: itemCount,
                orderBy: orderByParams,
                searchString
            }, (res: FindResponse<M>) => onEntitiesUpdate(res.data), onError);
        } else {
            accessor.find({
                where: whereParams,
                limit: itemCount,
                orderBy: orderByParams,
                searchString
            })
                .then((res: FindResponse<M>) => onEntitiesUpdate(res.data))
                .catch(onError);
            unsubscribe = () => undefined;
        }
        
        return unsubscribe;
    }, [dataClient, path, itemCount, currentSort, sortByProperty, filterValues, searchString]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const orderedData = useDataOrder({
        data: rawData,
        entitiesDisplayedFirst
    });

    // hack to fix Firestore listeners firing with incomplete data
    // const data = useDebouncedData(orderedData, {
    //     filterValues,
    //     sortBy,
    //     searchString,
    //     lastDeleteTimestamp
    // });
    const data = orderedData;

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

function useUpdateUrl<M extends Record<string, any> = any>(
    filterValues: FilterValues<Extract<keyof M, string>> | undefined,
    sortBy: [Extract<keyof M, string>, "asc" | "desc"] | undefined,
    searchString: string | undefined,
    updateUrl: boolean | undefined
) {

    useEffect(() => {
        if (updateUrl) {
            // Parse existing URL params to preserve non-filter/sort params like __view
            const existingParams = new URLSearchParams(window.location.search);
            const preservedParams = new URLSearchParams();

            // Preserve params that are not filter/sort related
            existingParams.forEach((value, key) => {
                if (key.startsWith("__") && key !== "__sort" && key !== "__sort_order") {
                    preservedParams.set(key, value);
                }
            });

            const filterSortState = encodeFilterAndSort(filterValues, sortBy);
            const search = searchString ? `search=${encodeURIComponent(searchString)}` : "";

            // Combine preserved params with filter/sort state
            const preservedString = preservedParams.toString();
            const parts = [preservedString, filterSortState, search].filter(Boolean);
            const state = parts.join("&");

            const hash = window.location.hash;
            if (state === "")
                window.history.replaceState({}, "", `${window.location.pathname}${hash}`);
            else
                window.history.replaceState({}, "", `?${state}${hash}`);
        }
    }, [filterValues, sortBy, searchString, updateUrl]);
}

function encodeFilterAndSort(filterValues?: FilterValues<string>, sortBy?: [string, "asc" | "desc"] | undefined) {
    const entries: Record<string, string> = {};
    if (sortBy) {
        entries["__sort"] = encodeURIComponent(sortBy[0]);
        entries["__sort_order"] = encodeURIComponent(sortBy[1]);
    }
    if (filterValues) {
        Object.entries(filterValues).forEach(([key, value]) => {
            if (value) {
                const [op, val] = value;
                let encodedValue: unknown = val;
                try {
                    if (typeof val === "object") {
                        if (val instanceof Date) {
                            encodedValue = val.toISOString();
                        } else if (Array.isArray(val)) {
                            encodedValue = JSON.stringify(val, (k, v) => {
                                if (v instanceof EntityRelation) {
                                    return encodeRelation(v);
                                }
                                if (v instanceof EntityReference) {
                                    return encodeReference(v);
                                }
                                return v;
                            });
                        } else if (val instanceof EntityRelation) {
                            encodedValue = encodeRelation(val);
                        } else if (val instanceof EntityReference) {
                            encodedValue = encodeReference(val);
                        }
                    }
                } catch (e) {
                    encodedValue = val;
                }
                if (encodedValue !== undefined) {
                    entries[encodeURIComponent(`${key}_op`)] = encodeURIComponent(op);
                    entries[encodeURIComponent(`${key}_value`)] = encodedValue ? encodeURIComponent(String(encodedValue)) : "null";
                }
            }
        });
    }
    if (!Object.keys(entries).length) {
        return "";
    }
    return Object.entries(entries).map(([key, value]) => `${key}=${value}`).join("&");
}

function parseFilterAndSort<M>(search: string): {
    filterValues: FilterValues<string> | undefined,
    sortBy?: [Extract<keyof M, string>, "asc" | "desc"]
} {
    const entries = new URLSearchParams(search);
    const filterValues: FilterValues<string> = {};
    let sortBy: [string, "asc" | "desc"] | undefined = undefined;
    entries.forEach((value, key) => {
        if (key === "__sort") {
            sortBy = [decodeURIComponent(value), entries.get("__sort_order") as "asc" | "desc"];
        } else if (key.endsWith("_op")) {
            const field = key.replace("_op", "");
            const filterOp = decodeURIComponent(value) as WhereFilterOp;
            const filterValStr = entries.get(`${field}_value`);
            if (filterValStr !== null) {
                filterValues[field] = [filterOp, decodeString(filterValStr)];
            }
        }
    });

    return {
        filterValues: Object.keys(filterValues).length ? filterValues : undefined,
        sortBy
    }
}

function isDate(dateString: string): boolean {
    // Define a regex pattern that matches the exact date format: 2025-01-07T23:00:00.000Z
    const regexPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    // Test the dateString against the regex pattern
    if (!regexPattern.test(dateString)) {
        return false;
    }

    // If the regex matches, further validate if it is a valid UTC date
    const date = new Date(dateString);
    return date.toISOString() === dateString;
}

function encodeReference(val: EntityReference) {
    return `ref::${val.path}/${val.id}`;
}
function encodeRelation(val: EntityRelation) {
    return `rel::${val.path}/${val.id}`;
}

function decodeString(val: string): EntityReference | EntityRelation | Date | string {
    let parsedFilterVal: EntityReference | EntityRelation | Date | string = val;
    if (isDate(val)) {
        try {
            parsedFilterVal = new Date(val);
        } catch (_e) {
            // ignore
        }
    }
    if (typeof parsedFilterVal === "string") {
        try {
            parsedFilterVal = JSON.parse(parsedFilterVal, (key, value) => {
                if (typeof value === "string") {
                    if (value.startsWith("ref::")) {
                        const [path, id] = value.substring(5).split("/");
                        return new EntityReference({ id, path });
                    }
                    if (value.startsWith("rel::")) {
                        const [path, id] = value.substring(5).split("/");
                        return new EntityRelation(id, path);
                    }
                }
                return value;
            });
        } catch (_e) {
            // ignore
        }
    }

    if (typeof parsedFilterVal === "string") {
        if (parsedFilterVal.startsWith("ref::")) {
            const [path, id] = parsedFilterVal.substring(5).split("/");
            return new EntityReference({ id, path });
        }
        if (parsedFilterVal.startsWith("rel::")) {
            const [path, id] = parsedFilterVal.substring(5).split("/");
            return new EntityRelation(id, path);
        }
    }
    return parsedFilterVal;
}
