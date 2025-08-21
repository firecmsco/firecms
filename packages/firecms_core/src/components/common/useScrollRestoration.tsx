import { Entity, FilterValues } from "@firecms/types";

const collectionScrollCache = new Map<string, { scrollOffset: number, data: Entity<any>[] }>();

export type ScrollRestorationController = {

    getCollectionScroll: (path: string,
                          filters?: FilterValues<any>) => {
        scrollOffset: number,
        data: Entity<any>[]
    } | undefined;

    updateCollectionScroll: (props: {
        path: string,
        scrollOffset: number,
        filters?: FilterValues<any>;
        data: Entity<any>[]
    }) => void;

}

export function useScrollRestoration(): ScrollRestorationController {

    const updateCollectionScroll = ({
                                        path,
                                        filters,
                                        scrollOffset,
                                        data
                                    }: {
        path: string;
        filters?: FilterValues<any>;
        sort?: [string, "asc" | "desc"];
        scrollOffset: number;
        data: Entity<any>[]
    }) => {
        collectionScrollCache.set(
            createCacheKey(path, filters),
            {
                scrollOffset,
                data
            })
    }

    const getCollectionScroll = (path: string,
                                 filters?: FilterValues<any>) => {
        return collectionScrollCache.get(createCacheKey(path, filters));
    }

    return {
        getCollectionScroll,
        updateCollectionScroll
    }
}

function createCacheKey(path: string, filters?: FilterValues<any>) {

    if (!filters) {
        return path;
    }

    // codify the filters into a url friendly string
    const filtersString = filters ? Object.keys(filters).map(key => {
        const value = JSON.stringify(filters[key]);
        return `${key}=${value}`;
    }).join("&") : "";

    return `${path}?${filtersString}`;
}
