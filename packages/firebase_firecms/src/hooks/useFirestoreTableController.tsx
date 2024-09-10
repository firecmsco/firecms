import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
    Entity,
    EntityCollection,
    EntityTableController,
    FilterValues,
    FireCMSContext,
    SelectedCellProps,
    useFireCMSContext,
    useNavigationController,
    User,
    WhereFilterOp
} from "@firecms/core";
import {
    collection as collectionClause,
    DocumentSnapshot,
    getFirestore,
    limit as limitClause,
    onSnapshot,
    orderBy as orderByClause,
    Query,
    query,
    QueryConstraint,
    where as whereClause
} from "@firebase/firestore";
import { cmsToFirestoreModel, firestoreToCMSModel } from "./useFirestoreDelegate";
import { FirebaseApp } from "@firebase/app";

const DEFAULT_PAGE_SIZE = 50;

export type FirestoreTableControllerProps<M extends Record<string, any> = any> = {

    firebaseApp?: FirebaseApp;

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

}

/**
 * Use this hook to build a controller for the {@link EntityCollectionTable}.
 * This controller
 *
 * @param fullPath
 * @param collection
 * @param forceFilterFromProps
 * @param firebaseApp
 */
export function useFirestoreTableController<M extends Record<string, any> = any, UserType extends User = User>(
    {
        fullPath,
        collection,
        firebaseApp
    }: FirestoreTableControllerProps<M>)
    : EntityTableController<M> {

    const {
        initialFilter,
        initialSort,
        forceFilter
    } = collection;

    const [popupCell, setPopupCell] = React.useState<SelectedCellProps<M> | undefined>(undefined);

    const paginationEnabled = collection.pagination === undefined || Boolean(collection.pagination);
    const pageSize = typeof collection.pagination === "number" ? collection.pagination : DEFAULT_PAGE_SIZE;

    const [searchString, setSearchString] = React.useState<string | undefined>();
    const [itemCount, setItemCount] = React.useState<number | undefined>(paginationEnabled ? pageSize : undefined);

    const checkFilterCombination = useCallback((filterValues: FilterValues<any>,
                                                sortBy?: [string, "asc" | "desc"]) => {
        return true;
    }, []);

    const initialSortInternal = useMemo(() => {
        if (initialSort && forceFilter && !checkFilterCombination(forceFilter, initialSort)) {
            console.warn("Initial sort is not compatible with the force filter. Ignoring initial sort");
            return undefined;
        }
        return initialSort;
    }, [initialSort, forceFilter]);

    const [filterValues, setFilterValues] = React.useState<FilterValues<Extract<keyof M, string>> | undefined>(forceFilter ?? initialFilter ?? undefined);
    const [sortBy, setSortBy] = React.useState<[Extract<keyof M, string>, "asc" | "desc"] | undefined>(initialSortInternal);

    const sortByProperty = sortBy ? sortBy[0] : undefined;
    const currentSort = sortBy ? sortBy[1] : undefined;

    const context: FireCMSContext<UserType> = useFireCMSContext();

    const [rawData, setRawData] = useState<Entity<M>[]>([]);

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
                                path: fullPath,
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

        const firestore = firebaseApp ? getFirestore(firebaseApp) : getFirestore();
        const collectionReference: Query = collectionClause(firestore, fullPath);

        const queryParams: QueryConstraint[] = [];
        if (filterValues) {
            Object.entries(filterValues)
                .filter(([_, entry]) => !!entry)
                .forEach(([key, filterParameter]) => {
                    const [op, value] = filterParameter as [WhereFilterOp, any];
                    queryParams.push(whereClause(key, op, cmsToFirestoreModel(value, firestore)));
                });
        }

        if (sortByProperty && currentSort) {
            queryParams.push(orderByClause(sortByProperty, currentSort));
        }

        if (itemCount) {
            queryParams.push(limitClause(itemCount));
        }

        const q = query(collectionReference, ...queryParams);
        return onSnapshot(q,
            {
                next: (snapshot) => {
                    if (!searchString)
                        onEntitiesUpdate(snapshot.docs.map((doc) => createEntityFromDocument(doc)));
                },
                error: onError
            }
        );

    }, [fullPath, itemCount, currentSort, sortByProperty, filterValues, searchString]);

    return {
        data: rawData,
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
        paginationEnabled,
        pageSize,
        checkFilterCombination,
        popupCell,
        setPopupCell
    }
}

const createEntityFromDocument = <M extends Record<string, any>>(
    docSnap: DocumentSnapshot,
): Entity<M> => {
    const values = firestoreToCMSModel(docSnap.data());
    return {
        id: docSnap.id,
        path: getCMSPathFromFirestorePath(docSnap.ref.path),
        values
    };
};

function getCMSPathFromFirestorePath(fsPath: string): string {
    let to = fsPath.lastIndexOf("/");
    to = to === -1 ? fsPath.length : to;
    return fsPath.substring(0, to);
}
