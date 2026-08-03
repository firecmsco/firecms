import { useEffect, useRef, useState } from "react";

import { EntityCollection } from "../../types";
import { useCustomizationController, useDataSource, useFireCMSContext } from "../../hooks";

export interface UseTableSearchHelperParams<M extends Record<string, any>> {
    collection: EntityCollection<M>;
    fullPath: string;
    /** `fullPath` split at its real segment boundaries, when known. Never derived from it. */
    pathSegments?: string[];
    parentCollectionIds?: string[];
    /**
     * Search term that is already being applied without the user having gone through the
     * search bar, e.g. one restored from the URL query params. When set, text search is
     * initialised automatically instead of waiting for a click on the search bar.
     */
    initialSearchString?: string;
}

export function useTableSearchHelper<M extends Record<string, any>>({
                                                                        collection,
                                                                        fullPath,
                                                                        pathSegments,
                                                                        parentCollectionIds,
                                                                        initialSearchString
                                                                    }: UseTableSearchHelperParams<M>) {

    const context = useFireCMSContext();
    const customizationController = useCustomizationController();
    const dataSource = useDataSource();

    const [textSearchLoading, setTextSearchLoading] = useState<boolean>(false);
    const [textSearchInitialised, setTextSearchInitialised] = useState<boolean>(false);
    const autoInitialisedRef = useRef<boolean>(false);

    let onTextSearchClick: (() => void) | undefined;
    let textSearchEnabled = Boolean(collection.textSearchEnabled);

    const props = {
        context,
        path: fullPath,
        pathSegments,
        databaseId: collection.databaseId,
        collection,
        parentCollectionIds
    };

    const searchBlocked = customizationController.plugins?.find(p => {
        return p.collectionView?.blockSearch?.(props);
    });

    const addTextSearchClickListener = Boolean(dataSource?.initTextSearch) || customizationController.plugins?.find(p => Boolean(p.collectionView?.onTextSearchClick));

    if (addTextSearchClickListener) {

        onTextSearchClick = addTextSearchClickListener
            ? () => {
                setTextSearchLoading(true);
                const promises: Promise<boolean>[] = [];
                if (dataSource?.initTextSearch && !searchBlocked) {
                    promises.push(dataSource.initTextSearch(props));
                }
                if (searchBlocked) {
                    customizationController.plugins?.forEach(p => {
                        if (p.collectionView?.onTextSearchClick)
                            promises.push(p.collectionView.onTextSearchClick({
                                context,
                                path: fullPath,
                                pathSegments,
                                collection,
                                parentCollectionIds
                            }));
                    })
                }
                return Promise.all(promises)
                    .then((res: boolean[]) => {
                        if (res.every(Boolean)) setTextSearchInitialised(true);
                    })
                    .finally(() => setTextSearchLoading(false));
            }
            : undefined;

        customizationController.plugins?.forEach(p => {
            if (!textSearchEnabled)
                if (p.collectionView?.showTextSearchBar) {
                    textSearchEnabled = p.collectionView.showTextSearchBar({
                        context,
                        path: fullPath,
                        collection,
                        parentCollectionIds
                    });
                }
        })
    }

    // Only ever runs once, and only when a search term was restored from outside the search
    // bar: otherwise the search bar would show a term the user can neither edit nor clear,
    // because it stays read only until text search is initialised.
    const shouldAutoInitialise = Boolean(initialSearchString) && textSearchEnabled && !textSearchInitialised && Boolean(onTextSearchClick);
    useEffect(() => {
        if (autoInitialisedRef.current || !shouldAutoInitialise) return;
        autoInitialisedRef.current = true;
        onTextSearchClick?.();
    }, [shouldAutoInitialise]);

    return {
        textSearchLoading,
        textSearchInitialised,
        onTextSearchClick,
        textSearchEnabled
    };
}
