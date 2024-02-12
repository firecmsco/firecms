import { useState } from "react";

import { EntityCollection } from "../../types";
import { useCustomizationController, useFireCMSContext } from "../../hooks";

export interface UseTableSearchHelperParams<M extends Record<string, any>> {
    collection: EntityCollection<M>;
    fullPath: string;
    parentCollectionIds?: string[];
}

export function useTableSearchHelper<M extends Record<string, any>>({ collection, fullPath, parentCollectionIds }: UseTableSearchHelperParams<M>) {

    const context = useFireCMSContext();
    const customizationController = useCustomizationController();

    const [textSearchLoading, setTextSearchLoading] = useState<boolean>(false);
    const [textSearchInitialised, setTextSearchInitialised] = useState<boolean>(false);
    let onTextSearchClick: (() => void) | undefined;
    let textSearchEnabled = Boolean(collection.textSearchEnabled);
    if (customizationController?.plugins) {
        const addTextSearchClickListener = customizationController.plugins?.find(p => Boolean(p.collectionView?.onTextSearchClick));

        onTextSearchClick = addTextSearchClickListener
            ? () => {
                setTextSearchLoading(true);
                Promise.all(customizationController.plugins?.map(p => {
                    if (p.collectionView?.onTextSearchClick)
                        return p.collectionView.onTextSearchClick({ context, path: fullPath, collection, parentCollectionIds });
                    return Promise.resolve(true);
                }) as Promise<boolean>[])
                    .then((res) => {
                        if (res.every(Boolean)) setTextSearchInitialised(true);
                    })
                    .finally(() => setTextSearchLoading(false));
            }
            : undefined;

        customizationController.plugins?.forEach(p => {
            if (!textSearchEnabled)
                if (p.collectionView?.showTextSearchBar) {
                    textSearchEnabled = p.collectionView.showTextSearchBar({ context, path: fullPath, collection, parentCollectionIds });
                }
        })
    }
    return { textSearchLoading, textSearchInitialised, onTextSearchClick, textSearchEnabled };
}
