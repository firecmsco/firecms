import type { EntityCollection } from "@rebasepro/types";
import { useState } from "react";

;
import { useCustomizationController, useRebaseContext } from "../../hooks";

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

    const context = useRebaseContext();
    const customizationController = useCustomizationController();

    const [textSearchLoading, setTextSearchLoading] = useState<boolean>(false);
    const [textSearchInitialised, setTextSearchInitialised] = useState<boolean>(false);

    let onTextSearchClick: (() => void) | undefined;

    const props = {
        context,
        path,
        databaseId: collection.databaseId,
        collection,
        parentCollectionIds
    };

    const searchBlocked = customizationController.plugins?.find(p => {
        return p.hooks?.blockSearch?.(props);
    });

    const addTextSearchClickListener = customizationController.plugins?.find(p => Boolean(p.hooks?.onTextSearchClick));

    if (addTextSearchClickListener) {

        onTextSearchClick = addTextSearchClickListener
            ? () => {
                setTextSearchLoading(true);
                const promises: Promise<boolean>[] = [];
                if (searchBlocked) {
                    customizationController.plugins?.forEach(p => {
                        if (p.hooks?.onTextSearchClick)
                            promises.push(p.hooks.onTextSearchClick({
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

    }
    return {
        textSearchLoading,
        textSearchInitialised,
        onTextSearchClick
    };
}
