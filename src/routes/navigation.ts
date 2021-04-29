import { EntityCollection, EntitySchema } from "../models";
import { CMSView } from "../CMSAppProps";

const DATA_PATH = `/c`;

export interface BreadcrumbEntry {
    title: string;
    url: string;
}

export function isCollectionPath(path: string) {
    return path.startsWith(`${DATA_PATH}/`);
}

export function getEntityOrCollectionPath(path: string) {
    if (path.startsWith(`${DATA_PATH}/`))
        return path.replace(`${DATA_PATH}/`, "");
    throw Error("Expected path starting with " + DATA_PATH);
}

export function getEntityPath(entityId: string,
                              basePath: string,
                              subcollection?: string) {
    return `${DATA_PATH}/${removeInitialSlash(basePath)}/${entityId}${subcollection ? "/" + subcollection : ""}`;
}

export function getCMSPathFrom(fullPath: string) {
    return `${DATA_PATH}/${removeInitialSlash(fullPath)}`;
}

export function getRouterNewEntityPath(basePath: string) {
    return `${DATA_PATH}/${removeInitialSlash(basePath)}#new`;
}

export function buildCollectionPath(view: EntityCollection) {
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
export function getCollectionViewFromPath(path: string, collectionViews?: EntityCollection[]): EntityCollection | undefined {

    if(!collectionViews)
        return undefined;

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`Collection paths must have an odd number of segments: ${path}`);
    }

    let result: EntityCollection | undefined = getCollectionViewFromPathInternal(removeInitialAndTrailingSlashes(path), collectionViews);

    // if (!result) {
    //     throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    // }
    return result;

}

function getCollectionViewFromPathInternal<S extends EntitySchema>(path: string, collectionViews: EntityCollection[]): EntityCollection | undefined {

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    let result: EntityCollection | undefined = undefined;
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];
        const navigationEntry = collectionViews && collectionViews.find((entry) => entry.relativePath === subpathCombination);

        if (navigationEntry) {

            if (subpathCombination === path) {
                result = navigationEntry;
            } else if (navigationEntry.subcollections) {
                const newPath = path.replace(subpathCombination, "").split("/").slice(2).join("/");
                if (newPath.length > 0)
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
    const entries = subpaths.length > 0 && subpaths.length % 2 == 0 ? subpaths.splice(0, subpaths.length - 1) : subpaths;

    const length = entries.length;
    const result: string[] = [];
    for (let i = length; i > 0; i = i - 2) {
        result.push(entries.slice(0, i).join("/"));
    }
    return result;

}

export type NavigationViewEntry =
    NavigationViewEntity
    | NavigationViewCollection;

interface NavigationViewEntity {
    type: "entity";
    entityId: string;
    collectionPath: string;
    fullPath: string;
    parentCollection: EntityCollection;
}

interface NavigationViewCollection {
    type: "collection";
    fullPath: string;
    collection: EntityCollection;
}

export function getNavigationEntriesFromPathInternal<S extends EntitySchema>(path: string, allCollections: EntityCollection[], currentFullPath?: string): NavigationViewEntry[] {

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    let result: NavigationViewEntry[] = [];
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];
        const collection = allCollections && allCollections.find((entry) => entry.relativePath === subpathCombination);
        if (collection) {

            const collectionPath = currentFullPath && currentFullPath.length > 0
                ? (currentFullPath + "/" + collection.relativePath)
                : collection.relativePath;

            result.push({
                type: "collection",
                fullPath: collectionPath,
                collection
            });
            const restOfThePath = removeInitialAndTrailingSlashes(path.replace(subpathCombination, ""));
            const nextSegments = restOfThePath.length > 0 ? restOfThePath.split("/") : [];
            if (nextSegments.length > 0) {
                const entityId = nextSegments[0];
                const fullPath = collectionPath + "/" + entityId;
                result.push({
                    type: "entity",
                    entityId: entityId,
                    collectionPath,
                    fullPath: fullPath,
                    parentCollection: collection
                });
                if (collection.subcollections && nextSegments.length > 1) {
                    const newPath = nextSegments.slice(1).join("/");
                    result.push(...getNavigationEntriesFromPathInternal(newPath, collection.subcollections, fullPath));
                }
            }
            break;
        }

    }
    return result;
}

export interface TopNavigationEntry {
    url: string;
    name: string;
    description?: string;
    group?: string;
}

export function computeNavigation(navigation: EntityCollection[], additionalViews: CMSView[] | undefined): {
    navigationEntries: TopNavigationEntry[],
    groups: string[]
} {
    const navigationEntries: TopNavigationEntry[] = [
        ...navigation.map(view => ({
            url: buildCollectionPath(view),
            name: view.name,
            description: view.description,
            group: view.group
        })),
        ...(additionalViews ?? []).map(additionalView => ({
            url: addInitialSlash(additionalView.path),
            name: additionalView.name,
            description: additionalView.description,
            group: additionalView.group
        }))
    ];

    const groups: string[] = Array.from(new Set(
        Object.values(navigationEntries).map(e => e.group).filter(Boolean) as string[]
    ).values());

    return { navigationEntries, groups };
}
