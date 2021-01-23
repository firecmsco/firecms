import { EntityCollectionView, EntitySchema } from "../models";

const DATA_PATH = `/c`;

export interface BreadcrumbEntry {
    title: string;
    url: string;
}

export function getEntityPath(entityId: string,
                              basePath: string,
                              subcollection?: string) {
    return `${DATA_PATH}/${removeInitialSlash(basePath)}/${entityId}${subcollection ? "/" + subcollection : ""}`;
}

export function getEntityCopyPath(entityId: string,
                              basePath: string) {
    return `${DATA_PATH}/${removeInitialSlash(basePath)}/${entityId}?copy=true`;
}

export function getEntityPathFrom(fullPath: string) {
    return `${DATA_PATH}/${fullPath}`;
}

export function getRouterNewEntityPath(basePath: string) {
    return `${DATA_PATH}/${removeInitialSlash(basePath)}/new`;
}

export function buildCollectionPath(view: EntityCollectionView) {
    return `${DATA_PATH}/${removeInitialSlash(view.relativePath)}`;
}

export function removeInitialSlash(s: string) {
    if (s.startsWith("/"))
        return s.slice(1);
    else return s;
}

export function removeTrailingSlash(s: string) {
    if (s.endsWith("/"))
        return s.slice(0, -1);
    else return s;
}

export function removeInitialAndTrailingSlashes(s: string) {
    return removeInitialSlash(removeTrailingSlash(s));
}

export function addInitialSlash(s: string) {
    if (s.startsWith("/"))
        return s;
    else return `/${s}`;
}

export function getCollectionPathFrom(s: string) {
    return s.substr(0, s.lastIndexOf("/"));
}

/**
 * Find the corresponding view at any depth for a given path.
 * @param path
 * @param collectionViews
 */
export function getCollectionViewFromPath(path: string, collectionViews: EntityCollectionView[]): EntityCollectionView {

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`Collection paths must have an odd number of segments: ${path}`);
    }

    let result: EntityCollectionView | undefined = getCollectionViewFromPathInternal(path, collectionViews);

    if (!result) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }
    return result;

}

function getCollectionViewFromPathInternal<S extends EntitySchema>(path: string, collectionViews: EntityCollectionView[]): EntityCollectionView | undefined {

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    let result: EntityCollectionView | undefined = undefined;
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];
        const navigationEntry = collectionViews && collectionViews.find((entry) => entry.relativePath === subpathCombination);

        if (navigationEntry) {
            if (subpathCombination === path) {
                result = navigationEntry;
            } else if (navigationEntry.subcollections) {
                const newPath = path.replace(subpathCombination, "").split("/").slice(2).join("/");
                result = getCollectionViewFromPathInternal(newPath, navigationEntry.subcollections);
            }
        }

        if (result) break;
    }
    return result;
}


/**
 * Get the subcollection combinations from a path:
 * "sites/es/locales" => ["sites/es/locales", "sites"]
 * @param subpaths
 */
function getCollectionPathsCombinations(subpaths: string[]): string[] {

    const length = subpaths.length;
    const result: string[] = [];
    for (let i = length; i > 0; i = i - 2) {
        result.push(subpaths.slice(0, i).join("/"));
    }
    return result;

}
