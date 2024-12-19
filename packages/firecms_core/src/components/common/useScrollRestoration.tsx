import { Entity, FilterValues } from "../../types";

const collectionScrollCache = new Map<string, { scrollOffset: number, data: Entity<any>[] }>();

export type ScrollRestorationController = {

    getCollectionScroll: (fullPath: string,
                          filters?: FilterValues<any>) => {
        scrollOffset: number,
        data: Entity<any>[]
    } | undefined;

    updateCollectionScroll: (props: {
        fullPath: string,
        scrollOffset: number,
        filters?: FilterValues<any>;
        data: Entity<any>[]
    }) => void;

}

export function useScrollRestoration(): ScrollRestorationController {

    const updateCollectionScroll = ({
                                        fullPath,
                                        filters,
                                        scrollOffset,
                                        data
                                    }: {
        fullPath: string;
        filters?: FilterValues<any>;
        sort?: [string, "asc" | "desc"];
        scrollOffset: number;
        data: Entity<any>[]
    }) => {
        collectionScrollCache.set(
            createCacheKey(fullPath, filters),
            {
                scrollOffset,
                data
            })
    }

    const getCollectionScroll = (fullPath: string,
                                 filters?: FilterValues<any>) => {
        return collectionScrollCache.get(createCacheKey(fullPath, filters));
    }

    return {
        getCollectionScroll,
        updateCollectionScroll
    }
}

function createCacheKey(fullPath: string, filters?: FilterValues<any>) {

    if (!filters) {
        return fullPath;
    }

    // codify the filters into a url friendly string
    const filtersString = filters ? Object.keys(filters).map(key => {
        const value = JSON.stringify(filters[key]);
        return `${key}=${value}`;
    }).join("&") : "";

    return `${fullPath}?${filtersString}`;
}
