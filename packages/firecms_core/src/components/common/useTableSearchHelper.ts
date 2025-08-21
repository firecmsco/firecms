import { useState } from "react";

import { EntityCollection } from "@firecms/types";
import { useCustomizationController, useDataSource, useFireCMSContext } from "../../hooks";

export interface UseTableSearchHelperParams<M extends Record<string, any>> {
    collection: EntityCollection<M>;
    path: string;
    parentCollectionIds?: string[];
}

export function useTableSearchHelper<M extends Record<string, any>>({
                                                                        collection,
                                                                        path,
                                                                        parentCollectionIds
                                                                    }: UseTableSearchHelperParams<M>) {

    const context = useFireCMSContext();
    const customizationController = useCustomizationController();
    const dataSource = useDataSource();

    const [textSearchLoading, setTextSearchLoading] = useState<boolean>(false);
    const [textSearchInitialised, setTextSearchInitialised] = useState<boolean>(false);

    let onTextSearchClick: (() => void) | undefined;
    let textSearchEnabled = Boolean(collection.textSearchEnabled);

    const props = {
        context,
        path,
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
                                path,
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
                        path,
                        collection,
                        parentCollectionIds
                    });
                }
        })
    }
    return {
        textSearchLoading,
        textSearchInitialised,
        onTextSearchClick,
        textSearchEnabled
    };
}
